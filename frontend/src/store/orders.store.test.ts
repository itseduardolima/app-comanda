/**
 * Offline-first behavior of the orders store (HU-28).
 *
 * The network layer (../api/orders) is mocked so tests can simulate a
 * connection loss during a mutation and the later reconnection drain.
 * Under Jest, localStore is the in-memory implementation (NODE_ENV=test).
 */
import { NetworkError } from '../api/client';
import * as kitchenApi from '../api/kitchen';
import * as ordersApi from '../api/orders';
import { localStore } from '../db/schema';
import { drain, pendingCount } from '../db/sync-queue';
import { MenuItem } from '../types/menu';
import { Order, OrderItem } from '../types/order';
import { isLocalId, useOrdersStore } from './orders.store';

jest.mock('../api/orders');
jest.mock('../api/kitchen');

const mockedApi = jest.mocked(ordersApi);
const mockedKitchenApi = jest.mocked(kitchenApi);

/** Lets pending promise chains (automatic drains) settle. */
async function flush(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(() => resolve()));
  await new Promise<void>((resolve) => setImmediate(() => resolve()));
}

function serverOrder(id: string, overrides: Partial<Order> = {}): Order {
  return {
    id,
    type: 'counter',
    tableId: null,
    table: null,
    customerName: null,
    paymentStatus: 'unpaid',
    createdAt: '2026-07-18T12:00:00.000Z',
    items: [],
    ...overrides,
  };
}

function serverItem(id: string, orderId: string, overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id,
    orderId,
    menuItemId: 'menu-1',
    quantity: 1,
    finalPrice: 2500,
    modifiers: null,
    kitchenStatus: 'queued',
    kitchenTicketId: null,
    ...overrides,
  };
}

const burger: MenuItem = {
  id: 'menu-1',
  name: 'X-Burger',
  price: 2500,
  category: 'Lanches',
  customization: {
    extraIngredients: [
      { name: 'Bacon', price: 300 },
      { name: 'Cheddar', price: 200 },
    ],
  },
};

beforeEach(async () => {
  // Let any drain left over from the previous test settle before resetting.
  await flush();
  jest.resetAllMocks();
  localStore.clearAll();
  useOrdersStore.setState({
    orders: {},
    aliases: {},
    tickets: {},
    loading: false,
    loadError: false,
    pendingSyncCount: 0,
    syncError: null,
  });
  // Safe default so an unexpected refresh() never explodes on undefined.
  mockedApi.listOrders.mockResolvedValue([]);
});

afterEach(async () => {
  await flush();
});

describe('orders store — offline-first (HU-28)', () => {
  it('createOrderLocal returns a local id, enqueues, and swaps to the server id when sync resolves', async () => {
    mockedApi.createOrder.mockResolvedValue(serverOrder('srv-1', { customerName: 'Marcos' }));

    const localId = useOrdersStore
      .getState()
      .createOrderLocal({ type: 'counter', customerName: 'Marcos' });

    expect(isLocalId(localId)).toBe(true);

    // Synchronously after the call: local order visible, flagged and enqueued.
    const before = useOrdersStore.getState();
    expect(before.orders[localId]).toBeDefined();
    expect(before.orders[localId].pendingSync).toBe(true);
    expect(before.pendingSyncCount).toBe(1);
    expect(pendingCount()).toBe(1);

    // Drain runs automatically on enqueue — let it settle.
    await flush();

    expect(mockedApi.createOrder).toHaveBeenCalledWith({ type: 'counter', customerName: 'Marcos' });

    const after = useOrdersStore.getState();
    expect(after.orders[localId]).toBeUndefined();
    expect(after.orders['srv-1']).toBeDefined();
    expect(after.aliases[localId]).toBe('srv-1');
    // Screens holding the local id keep working through the alias.
    expect(after.getOrder(localId)?.id).toBe('srv-1');
    expect(after.pendingSyncCount).toBe(0);
    expect(pendingCount()).toBe(0);
  });

  it('keeps the order locally when the connection drops mid-mutation, then syncs on drain', async () => {
    // Connection lost: the create request never reaches the server.
    mockedApi.createOrder.mockRejectedValue(new NetworkError());

    const localId = useOrdersStore
      .getState()
      .createOrderLocal({ type: 'counter', customerName: 'Ana' });
    await flush();

    const offline = useOrdersStore.getState();
    // The mutation survived the failure: order kept locally, still queued.
    expect(offline.orders[localId]).toBeDefined();
    expect(offline.orders[localId].pendingSync).toBe(true);
    expect(offline.pendingSyncCount).toBeGreaterThan(0);
    expect(pendingCount()).toBeGreaterThan(0);
    // UI state is not blocked: no spinner, no fatal sync error, data readable.
    expect(offline.loading).toBe(false);
    expect(offline.syncError).toBeNull();
    expect(offline.getOrder(localId)?.customerName).toBe('Ana');

    // Connection restored.
    mockedApi.createOrder.mockResolvedValue(serverOrder('srv-2', { customerName: 'Ana' }));
    await drain();
    await flush();

    const online = useOrdersStore.getState();
    expect(online.pendingSyncCount).toBe(0);
    expect(pendingCount()).toBe(0);
    expect(online.aliases[localId]).toBe('srv-2');
    expect(online.orders[localId]).toBeUndefined();
    expect(online.getOrder(localId)?.id).toBe('srv-2');
  });

  it('addItemLocal computes finalPrice = base + chosen extras and attaches the item as queued', async () => {
    // Stay offline the whole test so ids never swap under us.
    mockedApi.createOrder.mockRejectedValue(new NetworkError());

    const localId = useOrdersStore.getState().createOrderLocal({ type: 'counter' });
    await flush();

    useOrdersStore
      .getState()
      .addItemLocal(localId, burger, 2, { add: ['Bacon', 'Cheddar'], note: 'Sem cebola' });
    await flush();

    const order = useOrdersStore.getState().getOrder(localId);
    expect(order).toBeDefined();
    expect(order!.items).toHaveLength(1);

    const item = order!.items[0];
    expect(item.finalPrice).toBe(2500 + 300 + 200);
    expect(item.kitchenStatus).toBe('queued');
    expect(item.quantity).toBe(2);
    expect(item.menuItemId).toBe('menu-1');
    expect(item.modifiers).toEqual({ add: ['Bacon', 'Cheddar'], note: 'Sem cebola' });
    expect(isLocalId(item.id)).toBe(true);
  });

  it('drains two offline mutations FIFO, remapping the order id into queued payloads', async () => {
    mockedApi.createOrder.mockRejectedValue(new NetworkError());
    mockedApi.addOrderItem.mockRejectedValue(new NetworkError());

    const localId = useOrdersStore.getState().createOrderLocal({ type: 'counter' });
    await flush();
    useOrdersStore.getState().addItemLocal(localId, burger, 1);
    await flush();

    // Both mutations are parked in the queue.
    expect(useOrdersStore.getState().pendingSyncCount).toBe(2);
    expect(pendingCount()).toBe(2);
    // The FIFO drain stops at the first (failing) entry: item never attempted.
    expect(mockedApi.addOrderItem).not.toHaveBeenCalled();

    // Connection restored.
    mockedApi.createOrder.mockClear();
    mockedApi.createOrder.mockResolvedValue(serverOrder('srv-3'));
    mockedApi.addOrderItem.mockImplementation((orderId) =>
      Promise.resolve(serverItem('item-9', orderId)),
    );

    await drain();
    await flush();

    expect(mockedApi.createOrder).toHaveBeenCalledTimes(1);
    expect(mockedApi.addOrderItem).toHaveBeenCalledTimes(1);
    // FIFO: the order was created before its item was pushed.
    expect(mockedApi.createOrder.mock.invocationCallOrder[0]).toBeLessThan(
      mockedApi.addOrderItem.mock.invocationCallOrder[0],
    );
    // The queued add_item payload was rewritten to the new server order id.
    expect(mockedApi.addOrderItem).toHaveBeenCalledWith('srv-3', {
      menuItemId: 'menu-1',
      quantity: 1,
    });

    const state = useOrdersStore.getState();
    expect(state.pendingSyncCount).toBe(0);
    expect(pendingCount()).toBe(0);
    expect(state.getOrder(localId)?.id).toBe('srv-3');
    expect(state.getOrder(localId)?.items[0].id).toBe('item-9');
  });
});

describe('orders store — WebSocket deltas (HU-32)', () => {
  function seed(order: Order): void {
    useOrdersStore.setState({ orders: { [order.id]: order } });
  }

  /** Every event below must land purely from its payload. */
  function expectNoRestCall(): void {
    expect(mockedApi.getOrder).not.toHaveBeenCalled();
    expect(mockedApi.listOrders).not.toHaveBeenCalled();
    expect(mockedKitchenApi.listTickets).not.toHaveBeenCalled();
  }

  it('applyOrderUpdated — item_added appends the item without any REST call', async () => {
    seed(serverOrder('srv-10'));

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'unpaid',
      change: { kind: 'item_added', item: serverItem('item-1', 'srv-10', { menuItem: burger }) },
    });
    await flush();

    const order = useOrdersStore.getState().getOrder('srv-10');
    expect(order?.items.map((item) => item.id)).toEqual(['item-1']);
    expect(order?.items[0].menuItem?.name).toBe('X-Burger');
    expectNoRestCall();
    // Offline-first: the delta is persisted locally too.
    expect(localStore.getOrders().find((cached) => cached.id === 'srv-10')?.items).toHaveLength(1);
  });

  it('applyOrderUpdated — item_added replaces instead of duplicating an item already known', async () => {
    seed(serverOrder('srv-10', { items: [serverItem('item-1', 'srv-10', { quantity: 1 })] }));

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'unpaid',
      change: { kind: 'item_added', item: serverItem('item-1', 'srv-10', { quantity: 3 }) },
    });
    await flush();

    const order = useOrdersStore.getState().getOrder('srv-10');
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0].quantity).toBe(3);
    expectNoRestCall();
  });

  it('applyOrderUpdated — item_updated replaces the item by id without any REST call', async () => {
    seed(
      serverOrder('srv-10', {
        items: [serverItem('item-1', 'srv-10'), serverItem('item-2', 'srv-10')],
      }),
    );

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'unpaid',
      change: {
        kind: 'item_updated',
        item: serverItem('item-2', 'srv-10', { quantity: 5, finalPrice: 3000 }),
      },
    });
    await flush();

    const items = useOrdersStore.getState().getOrder('srv-10')?.items ?? [];
    expect(items).toHaveLength(2);
    expect(items[1]).toMatchObject({ id: 'item-2', quantity: 5, finalPrice: 3000 });
    expect(items[0].quantity).toBe(1);
    expectNoRestCall();
  });

  it('applyOrderUpdated — item_removed drops the item by id without any REST call', async () => {
    seed(
      serverOrder('srv-10', {
        items: [serverItem('item-1', 'srv-10'), serverItem('item-2', 'srv-10')],
      }),
    );

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'unpaid',
      change: { kind: 'item_removed', itemId: 'item-1' },
    });
    await flush();

    expect(useOrdersStore.getState().getOrder('srv-10')?.items.map((item) => item.id)).toEqual([
      'item-2',
    ]);
    expectNoRestCall();
  });

  it('applyOrderUpdated — items_queued patches the sent items in bulk without any REST call', async () => {
    seed(
      serverOrder('srv-10', {
        items: [
          serverItem('item-1', 'srv-10', { kitchenStatus: 'delivered' }),
          serverItem('item-2', 'srv-10', { kitchenStatus: 'delivered' }),
          serverItem('item-3', 'srv-10', { kitchenStatus: 'delivered' }),
        ],
      }),
    );

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'unpaid',
      change: {
        kind: 'items_queued',
        items: [
          serverItem('item-1', 'srv-10', { kitchenStatus: 'queued', kitchenTicketId: 'ticket-1' }),
          serverItem('item-3', 'srv-10', { kitchenStatus: 'queued', kitchenTicketId: 'ticket-1' }),
        ],
      },
    });
    await flush();

    const items = useOrdersStore.getState().getOrder('srv-10')?.items ?? [];
    expect(items.map((item) => item.kitchenTicketId)).toEqual(['ticket-1', null, 'ticket-1']);
    expect(items.map((item) => item.kitchenStatus)).toEqual(['queued', 'delivered', 'queued']);
    expectNoRestCall();
  });

  it('applyOrderUpdated — order_closed applies payment/close fields without any REST call', async () => {
    seed(serverOrder('srv-10', { paymentStatus: 'unpaid', tableId: 'table-1' }));

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'paid',
      tableId: null,
      tableStatus: 'free',
      closedAt: '2026-07-18T14:00:00.000Z',
      change: { kind: 'order_closed' },
    });
    await flush();

    const order = useOrdersStore.getState().getOrder('srv-10');
    expect(order?.paymentStatus).toBe('paid');
    expect(order?.closedAt).toBe('2026-07-18T14:00:00.000Z');
    expect(order?.tableId).toBeNull();
    expectNoRestCall();
    expect(localStore.getOrders().find((cached) => cached.id === 'srv-10')?.paymentStatus).toBe(
      'paid',
    );
  });

  it('applyOrderUpdated — order_created leaves a locally known order untouched, with no REST call', async () => {
    const seeded = serverOrder('srv-10', { items: [serverItem('item-1', 'srv-10')] });
    seed(seeded);

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-10',
      paymentStatus: 'unpaid',
      change: { kind: 'order_created' },
    });
    await flush();

    expect(useOrdersStore.getState().getOrder('srv-10')).toEqual(seeded);
    expectNoRestCall();
  });

  it('applyOrderUpdated refetches only for an order unknown on this device (no baseline)', async () => {
    mockedApi.getOrder.mockResolvedValue(
      serverOrder('srv-11', { items: [serverItem('item-1', 'srv-11')] }),
    );

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'srv-11',
      paymentStatus: 'unpaid',
      change: { kind: 'item_added', item: serverItem('item-1', 'srv-11') },
    });
    await flush();

    expect(mockedApi.getOrder).toHaveBeenCalledWith('srv-11');
    expect(useOrdersStore.getState().getOrder('srv-11')?.items).toHaveLength(1);
  });

  it('applyOrderUpdated resolves local ids through the alias map, with no REST call', async () => {
    useOrdersStore.setState({
      orders: { 'srv-12': serverOrder('srv-12') },
      aliases: { 'local-order-x': 'srv-12' },
    });

    useOrdersStore.getState().applyOrderUpdated({
      orderId: 'local-order-x',
      paymentStatus: 'paid',
      closedAt: '2026-07-18T15:00:00.000Z',
      change: { kind: 'order_closed' },
    });
    await flush();

    expect(useOrdersStore.getState().getOrder('srv-12')?.paymentStatus).toBe('paid');
    expectNoRestCall();
  });

  it('applyTicketCreated stores the ticket from the payload, with no REST call', async () => {
    seed(serverOrder('srv-13'));
    const ticket = {
      id: 'ticket-2',
      orderId: 'srv-13',
      number: 8,
      createdAt: '2026-07-18T13:30:00.000Z',
      items: [serverItem('item-1', 'srv-13')],
    };

    useOrdersStore.getState().applyTicketCreated({ orderId: 'srv-13', ticketNumber: 8, ticket });
    await flush();

    expect(useOrdersStore.getState().tickets['srv-13']).toEqual([ticket]);
    expectNoRestCall();
  });

  it('applyTicketCreated ignores a ticket number already known locally', async () => {
    seed(serverOrder('srv-13'));
    const known = {
      id: 'ticket-1',
      orderId: 'srv-13',
      number: 7,
      createdAt: '2026-07-18T13:00:00.000Z',
      items: [],
    };
    useOrdersStore.setState({ tickets: { 'srv-13': [known] } });

    useOrdersStore.getState().applyTicketCreated({
      orderId: 'srv-13',
      ticketNumber: 7,
      ticket: { ...known, id: 'ticket-duplicate' },
    });
    await flush();

    expect(useOrdersStore.getState().tickets['srv-13']).toEqual([known]);
    expectNoRestCall();
  });
});
