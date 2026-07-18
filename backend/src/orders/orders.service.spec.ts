import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { KitchenGateway } from '../kitchen/kitchen.gateway';
import { KitchenService } from '../kitchen/kitchen.service';
import { PrismaService } from '../prisma/prisma.service';
import { TablesService } from '../tables/tables.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  // Transaction client mock: $transaction invokes its callback with this object.
  const tx = {
    order: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  const prisma = {
    table: { findUnique: jest.fn() },
    order: { findUnique: jest.fn(), findMany: jest.fn() },
    menuItem: { findUnique: jest.fn() },
    orderItem: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(
      (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    ),
  };

  const tablesService = { refreshStatus: jest.fn() };
  const kitchenService = { sendToKitchen: jest.fn() };
  const kitchenGateway = { emitOrderUpdated: jest.fn() };

  const unpaidOrder = (overrides: Record<string, unknown> = {}) => ({
    id: 'order-1',
    type: 'dine_in',
    tableId: 'table-1',
    customerName: null,
    operatorId: 'op-1',
    paymentStatus: 'unpaid',
    closedAt: null,
    closedById: null,
    table: null,
    items: [],
    operator: { id: 'op-1', name: 'Ana' },
    closedBy: null,
    ...overrides,
  });

  const menuItem = (overrides: Record<string, unknown> = {}) => ({
    id: 'menu-1',
    name: 'Burger',
    price: 20,
    customization: {
      extraIngredients: [
        { name: 'Bacon', price: 4 },
        { name: 'Farofa', price: 2.5 },
      ],
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      prisma as unknown as PrismaService,
      tablesService as unknown as TablesService,
      kitchenService as unknown as KitchenService,
      kitchenGateway as unknown as KitchenGateway,
    );
  });

  describe('create', () => {
    it('throws NotFoundException for a dine_in order with an unknown table', async () => {
      prisma.table.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ type: 'dine_in', tableId: 'ghost-table' }, 'op-1'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.table.findUnique).toHaveBeenCalledWith({
        where: { id: 'ghost-table' },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });

    it('ignores tableId for a counter order and stores tableId as null', async () => {
      const created = { id: 'order-1', tableId: null };
      tx.order.create.mockResolvedValue(created);
      const full = unpaidOrder({ type: 'counter', tableId: null });
      tx.order.findUniqueOrThrow.mockResolvedValue(full);

      const result = await service.create(
        { type: 'counter', tableId: 'table-1' },
        'op-1',
      );

      expect(prisma.table.findUnique).not.toHaveBeenCalled();
      // No include on the initial create: the full order is re-fetched afterwards.
      expect(tx.order.create).toHaveBeenCalledWith({
        data: {
          type: 'counter',
          tableId: null,
          customerName: null,
          operatorId: 'op-1',
        },
      });
      expect(tx.order.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1' } }),
      );
      expect(tablesService.refreshStatus).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
      expect(result).toBe(full);
    });

    it('refreshes the table inside the transaction and emits order.updated with the refreshed status', async () => {
      prisma.table.findUnique.mockResolvedValue({ id: 'table-1' });
      tx.order.create.mockResolvedValue({ id: 'order-1', tableId: 'table-1' });
      // Deliberately not 'occupied': the emitted status must come from
      // refreshStatus, not be hardcoded.
      tablesService.refreshStatus.mockResolvedValue({
        id: 'table-1',
        status: 'free',
      });
      const full = unpaidOrder();
      tx.order.findUniqueOrThrow.mockResolvedValue(full);

      const result = await service.create(
        { type: 'dine_in', tableId: 'table-1' },
        'op-1',
      );

      // refreshStatus receives the transaction client, proving it ran inside $transaction.
      expect(tablesService.refreshStatus).toHaveBeenCalledWith(tx, 'table-1');
      expect(kitchenGateway.emitOrderUpdated).toHaveBeenCalledWith({
        orderId: 'order-1',
        paymentStatus: 'unpaid',
        tableId: 'table-1',
        tableStatus: 'free',
      });
      expect(result).toBe(full);
    });
  });

  describe('addItem', () => {
    it('computes finalPrice as base price plus chosen extras from customization', async () => {
      const order = unpaidOrder();
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.menuItem.findUnique.mockResolvedValue(menuItem());
      const createdItem = { id: 'item-1', menuItem: menuItem() };
      prisma.orderItem.create.mockResolvedValue(createdItem);

      const modifiers = { add: ['Bacon', 'Farofa'], remove: ['cebola'] };
      const result = await service.addItem('order-1', {
        menuItemId: 'menu-1',
        quantity: 2,
        modifiers,
      });

      expect(prisma.orderItem.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order-1',
          menuItemId: 'menu-1',
          quantity: 2,
          finalPrice: 26.5, // 20 + 4 (Bacon) + 2.5 (Farofa)
          modifiers,
        },
        include: { menuItem: true },
      });
      expect(kitchenGateway.emitOrderUpdated).toHaveBeenCalledWith({
        orderId: 'order-1',
        paymentStatus: 'unpaid',
        tableId: 'table-1',
      });
      expect(result).toBe(createdItem);
    });

    it('throws BadRequestException for an unknown extra ingredient name', async () => {
      prisma.order.findUnique.mockResolvedValue(unpaidOrder());
      prisma.menuItem.findUnique.mockResolvedValue(menuItem());

      await expect(
        service.addItem('order-1', {
          menuItemId: 'menu-1',
          quantity: 1,
          modifiers: { add: ['Nonexistent'], point: 'ao_ponto' },
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.orderItem.create).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the order is already paid', async () => {
      prisma.order.findUnique.mockResolvedValue(
        unpaidOrder({ paymentStatus: 'paid' }),
      );

      await expect(
        service.addItem('order-1', { menuItemId: 'menu-1', quantity: 1 }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.orderItem.create).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('throws ConflictException for an item already sent to the kitchen', async () => {
      prisma.order.findUnique.mockResolvedValue(unpaidOrder());
      prisma.orderItem.findFirst.mockResolvedValue({
        id: 'item-1',
        orderId: 'order-1',
        kitchenTicketId: 'ticket-1',
        menuItem: menuItem(),
      });

      await expect(
        service.updateItem('order-1', 'item-1', { quantity: 3 }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.orderItem.update).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('throws ConflictException for an item already sent to the kitchen', async () => {
      prisma.order.findUnique.mockResolvedValue(unpaidOrder());
      prisma.orderItem.findFirst.mockResolvedValue({
        id: 'item-1',
        orderId: 'order-1',
        kitchenTicketId: 'ticket-1',
        menuItem: menuItem(),
      });

      await expect(service.removeItem('order-1', 'item-1')).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(prisma.orderItem.delete).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('throws NotFoundException for an unknown order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.close('ghost-order', 'op-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the order is already paid', async () => {
      prisma.order.findUnique.mockResolvedValue(
        unpaidOrder({ paymentStatus: 'paid' }),
      );

      await expect(service.close('order-1', 'op-2')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });

    it('throws ConflictException when a concurrent close won the race (updateMany count 0)', async () => {
      prisma.order.findUnique.mockResolvedValue(unpaidOrder());
      tx.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.close('order-1', 'op-2')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(tx.order.updateMany).toHaveBeenCalledTimes(1);
      expect(tx.order.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(tablesService.refreshStatus).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).not.toHaveBeenCalled();
    });

    it('stamps paymentStatus/closedById, refreshes the table inside the transaction and emits order.updated', async () => {
      const closedAt = new Date('2026-07-18T12:00:00.000Z');
      prisma.order.findUnique.mockResolvedValue(unpaidOrder());
      const closed = unpaidOrder({
        paymentStatus: 'paid',
        closedAt,
        closedById: 'op-2',
      });
      tx.order.updateMany.mockResolvedValue({ count: 1 });
      tx.order.findUniqueOrThrow.mockResolvedValue(closed);
      tablesService.refreshStatus.mockResolvedValue({
        id: 'table-1',
        status: 'free',
      });

      const result = await service.close('order-1', 'op-2');

      // Conditional write: a concurrent close loses the race and gets 409.
      expect(tx.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1', paymentStatus: 'unpaid' },
          data: expect.objectContaining({
            paymentStatus: 'paid',
            closedById: 'op-2',
            closedAt: expect.any(Date) as unknown,
          }) as unknown,
        }),
      );
      // refreshStatus receives the transaction client, proving it ran inside $transaction.
      expect(tablesService.refreshStatus).toHaveBeenCalledWith(tx, 'table-1');
      expect(kitchenGateway.emitOrderUpdated).toHaveBeenCalledWith({
        orderId: 'order-1',
        paymentStatus: 'paid',
        tableId: 'table-1',
        tableStatus: 'free',
        closedAt: closedAt.toISOString(),
      });
      expect(result).toBe(closed);
    });

    it('skips table refresh and reports no tableStatus when the order has no table', async () => {
      prisma.order.findUnique.mockResolvedValue(
        unpaidOrder({ type: 'counter', tableId: null }),
      );
      const closed = unpaidOrder({
        type: 'counter',
        tableId: null,
        paymentStatus: 'paid',
        closedAt: new Date('2026-07-18T13:00:00.000Z'),
        closedById: 'op-2',
      });
      tx.order.updateMany.mockResolvedValue({ count: 1 });
      tx.order.findUniqueOrThrow.mockResolvedValue(closed);

      await service.close('order-1', 'op-2');

      expect(tablesService.refreshStatus).not.toHaveBeenCalled();
      expect(kitchenGateway.emitOrderUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ tableId: null, tableStatus: undefined }),
      );
    });
  });
});
