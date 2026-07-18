import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MenuItem, Prisma, TableStatus } from '@prisma/client';
import { KitchenGateway } from '../kitchen/kitchen.gateway';
import { KitchenService, TicketWithItems } from '../kitchen/kitchen.service';
import { PrismaService } from '../prisma/prisma.service';
import { TablesService } from '../tables/tables.service';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListFilter } from './dto/list-orders.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

const orderInclude = {
  table: true,
  items: { include: { menuItem: true } },
  operator: { select: { id: true, name: true } },
  closedBy: { select: { id: true, name: true } },
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
export type OrderItemWithMenuItem = Prisma.OrderItemGetPayload<{ include: { menuItem: true } }>;

interface MenuItemCustomization {
  extraIngredients?: { name: string; price: number }[];
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tablesService: TablesService,
    private readonly kitchenService: KitchenService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async create(dto: CreateOrderDto, operatorId: string): Promise<OrderWithDetails> {
    const tableId = dto.type === 'dine_in' ? dto.tableId : undefined;
    if (dto.type === 'dine_in') {
      const table = await this.prisma.table.findUnique({ where: { id: tableId } });
      if (!table) {
        throw new NotFoundException('Table not found');
      }
    }

    const { order, tableStatus } = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          type: dto.type,
          tableId: tableId ?? null,
          customerName: dto.customerName ?? null,
          operatorId,
        },
      });
      let status: TableStatus | undefined = undefined;
      if (created.tableId) {
        const table = await this.tablesService.refreshStatus(tx, created.tableId);
        status = table.status;
      }
      // Re-fetched after refreshStatus so order.table.status is not stale.
      const full = await tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: orderInclude,
      });
      return { order: full, tableStatus: status };
    });

    if (order.tableId) {
      this.kitchenGateway.emitOrderUpdated({
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        tableId: order.tableId,
        tableStatus,
      });
    }
    return order;
  }

  async findAll(filter: OrderListFilter = 'all'): Promise<OrderWithDetails[]> {
    const where: Prisma.OrderWhereInput =
      filter === 'open'
        ? { paymentStatus: 'unpaid' }
        : filter === 'paid'
          ? { paymentStatus: 'paid' }
          : {};
    return this.prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<OrderWithDetails> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async addItem(orderId: string, dto: AddOrderItemDto): Promise<OrderItemWithMenuItem> {
    const order = await this.requireUnpaidOrder(orderId);
    const menuItem = await this.prisma.menuItem.findUnique({ where: { id: dto.menuItemId } });
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    const item = await this.prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: menuItem.id,
        quantity: dto.quantity,
        finalPrice: this.computeUnitPrice(menuItem, dto.modifiers),
        modifiers: (dto.modifiers ?? undefined) as Prisma.InputJsonValue | undefined,
      },
      include: { menuItem: true },
    });

    this.emitOrderChanged(order.id, order.paymentStatus, order.tableId);
    return item;
  }

  async updateItem(
    orderId: string,
    itemId: string,
    dto: UpdateOrderItemDto,
  ): Promise<OrderItemWithMenuItem> {
    const order = await this.requireUnpaidOrder(orderId);
    const item = await this.requireEditableItem(orderId, itemId);

    // Recomputing here is safe: items can only be edited before being sent to
    // the kitchen, so this is still "the moment of ordering" — the frozen
    // final_price rule protects sent items from later menu price changes.
    const finalPrice =
      dto.modifiers !== undefined
        ? this.computeUnitPrice(item.menuItem, dto.modifiers)
        : undefined;

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
        modifiers:
          dto.modifiers !== undefined
            ? (dto.modifiers as Prisma.InputJsonValue)
            : undefined,
        finalPrice,
      },
      include: { menuItem: true },
    });

    this.emitOrderChanged(order.id, order.paymentStatus, order.tableId);
    return updated;
  }

  async removeItem(orderId: string, itemId: string): Promise<void> {
    const order = await this.requireUnpaidOrder(orderId);
    await this.requireEditableItem(orderId, itemId);
    await this.prisma.orderItem.delete({ where: { id: itemId } });
    this.emitOrderChanged(order.id, order.paymentStatus, order.tableId);
  }

  /**
   * "Fechar conta" (HU-38): flips unpaid → paid, stamps closed_at and the
   * closing operator (audit, HU-42). No payment processing of any kind.
   * Releases the table when this was its last open order (HU-41).
   */
  async close(orderId: string, closedById: string): Promise<OrderWithDetails> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentStatus === 'paid') {
      throw new ConflictException('Order is already paid');
    }

    const { closed, tableStatus } = await this.prisma.$transaction(async (tx) => {
      // Conditional write: a concurrent close loses the race and gets 409.
      const applied = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: 'unpaid' },
        data: { paymentStatus: 'paid', closedAt: new Date(), closedById },
      });
      if (applied.count === 0) {
        throw new ConflictException('Order is already paid');
      }
      const updated = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      let status: TableStatus | undefined = undefined;
      if (updated.tableId) {
        const table = await this.tablesService.refreshStatus(tx, updated.tableId);
        status = table.status;
      }
      // Re-fetched after refreshStatus so order.table.status is not stale.
      const full = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: orderInclude,
      });
      return { closed: full, tableStatus: status };
    });

    this.kitchenGateway.emitOrderUpdated({
      orderId: closed.id,
      paymentStatus: closed.paymentStatus,
      tableId: closed.tableId,
      tableStatus,
      closedAt: closed.closedAt?.toISOString() ?? null,
    });
    return closed;
  }

  /** Route lives under /orders for contract consistency; ticket logic is the kitchen domain. */
  async sendToKitchen(orderId: string): Promise<TicketWithItems> {
    const order = await this.requireUnpaidOrder(orderId);
    const ticket = await this.kitchenService.sendToKitchen(order.id);
    return ticket;
  }

  /**
   * Unit price frozen at ordering time: menu item base price plus the price
   * of each chosen extra ingredient (modifiers.add) found in the menu item's
   * customization config.
   */
  private computeUnitPrice(menuItem: MenuItem, modifiers?: Record<string, unknown>): number {
    const added = Array.isArray(modifiers?.add)
      ? modifiers.add.filter((name): name is string => typeof name === 'string')
      : [];
    if (added.length === 0) {
      return menuItem.price;
    }
    const customization = menuItem.customization as MenuItemCustomization | null;
    const extras = customization?.extraIngredients ?? [];
    const extrasTotal = added.reduce((total, name) => {
      const extra = extras.find((candidate) => candidate.name === name);
      if (!extra) {
        throw new BadRequestException(`Unknown extra ingredient: ${name}`);
      }
      return total + extra.price;
    }, 0);
    return menuItem.price + extrasTotal;
  }

  private async requireUnpaidOrder(orderId: string): Promise<OrderWithDetails> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentStatus === 'paid') {
      throw new ConflictException('Order is already paid');
    }
    return order;
  }

  private async requireEditableItem(
    orderId: string,
    itemId: string,
  ): Promise<OrderItemWithMenuItem> {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      include: { menuItem: true },
    });
    if (!item) {
      throw new NotFoundException('Order item not found');
    }
    if (item.kitchenTicketId !== null) {
      throw new ConflictException('Cannot modify an item already sent to the kitchen');
    }
    return item;
  }

  private emitOrderChanged(
    orderId: string,
    paymentStatus: OrderWithDetails['paymentStatus'],
    tableId: string | null,
  ): void {
    this.kitchenGateway.emitOrderUpdated({ orderId, paymentStatus, tableId });
  }
}
