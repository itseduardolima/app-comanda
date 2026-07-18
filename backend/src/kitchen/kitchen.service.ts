import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    if (order.items.length === 0) {
      throw new BadRequestException('Cannot send an order with no items to the kitchen');
    }
    const pendingItems = order.items.filter((item) => item.kitchenTicketId === null);
    if (pendingItems.length === 0) {
      throw new BadRequestException('All items were already sent to the kitchen');
    }

    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await tx.kitchenTicket.create({ data: { orderId } });
      await tx.orderItem.updateMany({
        where: { id: { in: pendingItems.map((item) => item.id) } },
        data: {
          kitchenTicketId: created.id,
          kitchenStatus: 'queued',
          kitchenStatusChangedAt: new Date(),
        },
      });
      return tx.kitchenTicket.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: { include: { menuItem: true } } },
      });
    });

    this.gateway.emitTicketCreated({ orderId, ticketNumber: ticket.number });
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

    const currentIndex = KITCHEN_STATUS_SEQUENCE.indexOf(item.kitchenStatus);
    const nextIndex = KITCHEN_STATUS_SEQUENCE.indexOf(next);
    if (nextIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Invalid kitchen status transition: ${item.kitchenStatus} → ${next}`,
      );
    }

    const changedAt = new Date();
    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { kitchenStatus: next, kitchenStatusChangedAt: changedAt },
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
