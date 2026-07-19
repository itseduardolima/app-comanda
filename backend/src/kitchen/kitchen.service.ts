import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KitchenStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KitchenGateway } from './kitchen.gateway';

/** Allowed transitions: strictly forward, one step at a time. */
const KITCHEN_STATUS_SEQUENCE: KitchenStatus[] = ['queued', 'preparing', 'ready', 'delivered'];

export type TicketWithItems = Prisma.KitchenTicketGetPayload<{
  include: { items: { include: { menuItem: true } } };
}>;

export type UpdatedKitchenItem = Prisma.OrderItemGetPayload<{
  include: { menuItem: true };
}>;

@Injectable()
export class KitchenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: KitchenGateway,
  ) {}

  /**
   * Sends the order's pending items to the kitchen: creates a sequential
   * ticket and attaches every item not yet linked to a ticket (HU-29).
   * Items already sent on a previous ticket are never re-enqueued.
   */
  async sendToKitchen(orderId: string): Promise<TicketWithItems> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentStatus === 'paid') {
      throw new ConflictException('Order is already paid');
    }
    if (order.items.length === 0) {
      throw new BadRequestException('Cannot send an order with no items to the kitchen');
    }
    const pendingItems = order.items.filter((item) => item.kitchenTicketId === null);
    if (pendingItems.length === 0) {
      throw new BadRequestException('All items were already sent to the kitchen');
    }

    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await tx.kitchenTicket.create({ data: { orderId } });
      // The kitchenTicketId: null guard makes concurrent send-to-kitchen calls
      // safe: items grabbed by another ticket in between are not re-assigned.
      const attached = await tx.orderItem.updateMany({
        where: { id: { in: pendingItems.map((item) => item.id) }, kitchenTicketId: null },
        data: {
          kitchenTicketId: created.id,
          kitchenStatus: 'queued',
          kitchenStatusChangedAt: new Date(),
        },
      });
      if (attached.count === 0) {
        throw new BadRequestException('All items were already sent to the kitchen');
      }
      return tx.kitchenTicket.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: { include: { menuItem: true } } },
      });
    });

    // Both events carry the full data the client needs to apply the delta
    // without a REST round-trip (HU-32): the ticket with its items for the
    // kitchen view, and the queued items for whoever watches the order.
    this.gateway.emitTicketCreated({ orderId, ticketNumber: ticket.number, ticket });
    this.gateway.emitOrderUpdated({
      orderId,
      paymentStatus: order.paymentStatus,
      tableId: order.tableId,
      change: { kind: 'items_queued', items: ticket.items },
    });
    return ticket;
  }

  /**
   * Updates a single item's kitchen status (HU-30). Only the exact next
   * status in `queued → preparing → ready → delivered` is accepted.
   */
  async updateItemStatus(itemId: string, next: KitchenStatus): Promise<UpdatedKitchenItem> {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });
    if (!item) {
      throw new NotFoundException('Order item not found');
    }
    if (item.kitchenTicketId === null) {
      throw new BadRequestException('Item has not been sent to the kitchen yet');
    }
    if (item.order.paymentStatus === 'paid') {
      throw new ConflictException('Order is already paid');
    }

    const currentIndex = KITCHEN_STATUS_SEQUENCE.indexOf(item.kitchenStatus);
    const nextIndex = KITCHEN_STATUS_SEQUENCE.indexOf(next);
    if (nextIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Invalid kitchen status transition: ${item.kitchenStatus} → ${next}`,
      );
    }

    const changedAt = new Date();
    // Conditional write: only succeeds if the status is still the one we
    // validated against, so concurrent transitions cannot double-apply.
    const applied = await this.prisma.orderItem.updateMany({
      where: { id: itemId, kitchenStatus: item.kitchenStatus },
      data: { kitchenStatus: next, kitchenStatusChangedAt: changedAt },
    });
    if (applied.count === 0) {
      throw new ConflictException('Item status changed concurrently, refresh and retry');
    }
    const updated = await this.prisma.orderItem.findUniqueOrThrow({
      where: { id: itemId },
      include: { menuItem: true },
    });

    this.gateway.emitItemStatusChanged({
      orderId: item.orderId,
      itemId: item.id,
      kitchenStatus: next,
      changedAt: changedAt.toISOString(),
    });
    return updated;
  }

  /** Tickets + current item statuses — the REST baseline used for resync (HU-33). */
  async getTickets(orderId?: string): Promise<TicketWithItems[]> {
    return this.prisma.kitchenTicket.findMany({
      where: orderId ? { orderId } : undefined,
      include: { items: { include: { menuItem: true } } },
      orderBy: { number: 'asc' },
    });
  }
}
