import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { KitchenStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KitchenGateway } from './kitchen.gateway';
import { KitchenService } from './kitchen.service';

interface OrderItemStub {
  id: string;
  orderId: string;
  kitchenTicketId: string | null;
  kitchenStatus: KitchenStatus;
  order: { paymentStatus: string };
}

const orderItem = (overrides: Partial<OrderItemStub> = {}): OrderItemStub => ({
  id: 'item-1',
  orderId: 'order-1',
  kitchenTicketId: null,
  kitchenStatus: 'queued',
  order: { paymentStatus: 'unpaid' },
  ...overrides,
});

describe('KitchenService', () => {
  let service: KitchenService;

  const txMock = {
    kitchenTicket: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    orderItem: {
      updateMany: jest.fn(),
    },
  };

  const prismaMock = {
    order: {
      findUnique: jest.fn(),
    },
    orderItem: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    kitchenTicket: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const gatewayMock = {
    emitTicketCreated: jest.fn(),
    emitItemStatusChanged: jest.fn(),
    emitOrderUpdated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );
    service = new KitchenService(
      prismaMock as unknown as PrismaService,
      gatewayMock as unknown as KitchenGateway,
    );
  });

  describe('sendToKitchen', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      await expect(service.sendToKitchen('missing-order')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(gatewayMock.emitTicketCreated).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the order is already paid', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'paid',
        items: [orderItem()],
      });

      await expect(service.sendToKitchen('order-1')).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(gatewayMock.emitTicketCreated).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the order has zero items', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'unpaid',
        items: [],
      });

      await expect(service.sendToKitchen('order-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(gatewayMock.emitTicketCreated).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when every item was already sent to the kitchen', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'unpaid',
        items: [
          orderItem({ id: 'item-1', kitchenTicketId: 'ticket-old' }),
          orderItem({ id: 'item-2', kitchenTicketId: 'ticket-old' }),
        ],
      });

      await expect(service.sendToKitchen('order-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(gatewayMock.emitTicketCreated).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when a concurrent ticket grabbed the items first (updateMany count 0)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'unpaid',
        items: [orderItem({ id: 'item-pending-1' })],
      });
      txMock.kitchenTicket.create.mockResolvedValue({ id: 'ticket-1', number: 8 });
      txMock.orderItem.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.sendToKitchen('order-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(txMock.kitchenTicket.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(gatewayMock.emitTicketCreated).not.toHaveBeenCalled();
      expect(gatewayMock.emitOrderUpdated).not.toHaveBeenCalled();
    });

    it('creates a ticket, queues only pending items and emits kitchen.ticket.created plus order.updated', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentStatus: 'unpaid',
        tableId: 'table-1',
        items: [
          orderItem({ id: 'item-pending-1' }),
          orderItem({ id: 'item-sent', kitchenTicketId: 'ticket-old' }),
          orderItem({ id: 'item-pending-2' }),
        ],
      });
      txMock.kitchenTicket.create.mockResolvedValue({ id: 'ticket-1', number: 7 });
      txMock.orderItem.updateMany.mockResolvedValue({ count: 2 });
      const ticketWithItems = {
        id: 'ticket-1',
        number: 7,
        orderId: 'order-1',
        items: [
          { id: 'item-pending-1', menuItem: { id: 'menu-1' } },
          { id: 'item-pending-2', menuItem: { id: 'menu-2' } },
        ],
      };
      txMock.kitchenTicket.findUniqueOrThrow.mockResolvedValue(ticketWithItems);

      const result = await service.sendToKitchen('order-1');

      expect(result).toBe(ticketWithItems);
      expect(txMock.kitchenTicket.create).toHaveBeenCalledWith({
        data: { orderId: 'order-1' },
      });
      expect(txMock.orderItem.updateMany).toHaveBeenCalledTimes(1);
      expect(txMock.orderItem.updateMany).toHaveBeenCalledWith({
        // kitchenTicketId: null guard keeps concurrent send-to-kitchen calls safe.
        where: {
          id: { in: ['item-pending-1', 'item-pending-2'] },
          kitchenTicketId: null,
        },
        data: {
          kitchenTicketId: 'ticket-1',
          kitchenStatus: 'queued',
          kitchenStatusChangedAt: expect.any(Date) as Date,
        },
      });
      expect(txMock.kitchenTicket.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        include: { items: { include: { menuItem: true } } },
      });
      // The full ticket rides on the event: no extra query here, and no REST
      // round-trip on the client to apply the delta (HU-32).
      expect(gatewayMock.emitTicketCreated).toHaveBeenCalledTimes(1);
      expect(gatewayMock.emitTicketCreated).toHaveBeenCalledWith({
        orderId: 'order-1',
        ticketNumber: 7,
        ticket: ticketWithItems,
      });
      // Order subscribers learn the items flipped to queued.
      expect(gatewayMock.emitOrderUpdated).toHaveBeenCalledTimes(1);
      expect(gatewayMock.emitOrderUpdated).toHaveBeenCalledWith({
        orderId: 'order-1',
        paymentStatus: 'unpaid',
        tableId: 'table-1',
        change: { kind: 'items_queued', items: ticketWithItems.items },
      });
    });
  });

  describe('updateItemStatus', () => {
    it('throws NotFoundException when the item does not exist', async () => {
      prismaMock.orderItem.findUnique.mockResolvedValue(null);

      await expect(service.updateItemStatus('missing-item', 'preparing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prismaMock.orderItem.updateMany).not.toHaveBeenCalled();
      expect(gatewayMock.emitItemStatusChanged).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the item was never sent to the kitchen', async () => {
      prismaMock.orderItem.findUnique.mockResolvedValue(
        orderItem({ kitchenTicketId: null, kitchenStatus: 'queued' }),
      );

      await expect(service.updateItemStatus('item-1', 'preparing')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.orderItem.updateMany).not.toHaveBeenCalled();
      expect(gatewayMock.emitItemStatusChanged).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the item belongs to an already paid order', async () => {
      prismaMock.orderItem.findUnique.mockResolvedValue(
        orderItem({
          kitchenTicketId: 'ticket-1',
          kitchenStatus: 'queued',
          order: { paymentStatus: 'paid' },
        }),
      );

      await expect(service.updateItemStatus('item-1', 'preparing')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prismaMock.orderItem.updateMany).not.toHaveBeenCalled();
      expect(gatewayMock.emitItemStatusChanged).not.toHaveBeenCalled();
    });

    it.each<[KitchenStatus, KitchenStatus]>([
      ['queued', 'delivered'],
      ['ready', 'preparing'],
      ['preparing', 'preparing'],
    ])('rejects the invalid transition %s -> %s', async (current, next) => {
      prismaMock.orderItem.findUnique.mockResolvedValue(
        orderItem({ kitchenTicketId: 'ticket-1', kitchenStatus: current }),
      );

      await expect(service.updateItemStatus('item-1', next)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.orderItem.updateMany).not.toHaveBeenCalled();
      expect(gatewayMock.emitItemStatusChanged).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the status changed concurrently (updateMany count 0)', async () => {
      prismaMock.orderItem.findUnique.mockResolvedValue(
        orderItem({ kitchenTicketId: 'ticket-1', kitchenStatus: 'queued' }),
      );
      prismaMock.orderItem.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.updateItemStatus('item-1', 'preparing')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prismaMock.orderItem.updateMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.orderItem.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(gatewayMock.emitItemStatusChanged).not.toHaveBeenCalled();
    });

    it('updates queued -> preparing and emits item.status.changed with an ISO changedAt', async () => {
      prismaMock.orderItem.findUnique.mockResolvedValue(
        orderItem({
          id: 'item-1',
          orderId: 'order-1',
          kitchenTicketId: 'ticket-1',
          kitchenStatus: 'queued',
        }),
      );
      prismaMock.orderItem.updateMany.mockResolvedValue({ count: 1 });
      const updatedItem = {
        id: 'item-1',
        kitchenStatus: 'preparing',
        menuItem: { id: 'menu-1' },
      };
      prismaMock.orderItem.findUniqueOrThrow.mockResolvedValue(updatedItem);

      const result = await service.updateItemStatus('item-1', 'preparing');

      expect(result).toBe(updatedItem);
      expect(prismaMock.orderItem.updateMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.orderItem.updateMany).toHaveBeenCalledWith({
        // Conditional write: only applies while the status is still the validated one.
        where: { id: 'item-1', kitchenStatus: 'queued' },
        data: {
          kitchenStatus: 'preparing',
          kitchenStatusChangedAt: expect.any(Date) as Date,
        },
      });
      expect(prismaMock.orderItem.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        include: { menuItem: true },
      });

      const updateArgs = prismaMock.orderItem.updateMany.mock.calls[0][0] as {
        data: { kitchenStatusChangedAt: Date };
      };
      expect(gatewayMock.emitItemStatusChanged).toHaveBeenCalledTimes(1);
      expect(gatewayMock.emitItemStatusChanged).toHaveBeenCalledWith({
        orderId: 'order-1',
        itemId: 'item-1',
        kitchenStatus: 'preparing',
        changedAt: updateArgs.data.kitchenStatusChangedAt.toISOString(),
      });
      const emitted = gatewayMock.emitItemStatusChanged.mock.calls[0][0] as {
        changedAt: string;
      };
      expect(emitted.changedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('getTickets', () => {
    it('filters by orderId when one is provided', async () => {
      const tickets = [{ id: 'ticket-1', orderId: 'order-1', items: [] }];
      prismaMock.kitchenTicket.findMany.mockResolvedValue(tickets);

      const result = await service.getTickets('order-1');

      expect(result).toBe(tickets);
      expect(prismaMock.kitchenTicket.findMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1' },
        include: { items: { include: { menuItem: true } } },
        orderBy: { number: 'asc' },
      });
    });

    it('returns all tickets when no orderId is provided', async () => {
      const tickets = [
        { id: 'ticket-1', orderId: 'order-1', items: [] },
        { id: 'ticket-2', orderId: 'order-2', items: [] },
      ];
      prismaMock.kitchenTicket.findMany.mockResolvedValue(tickets);

      const result = await service.getTickets();

      expect(result).toBe(tickets);
      expect(prismaMock.kitchenTicket.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { items: { include: { menuItem: true } } },
        orderBy: { number: 'asc' },
      });
    });
  });
});
