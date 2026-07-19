import { create } from 'zustand';
import * as kitchenApi from '../api/kitchen';
import * as ordersApi from '../api/orders';
import { drain, enqueue, pendingCount, setSyncListener } from '../db/sync-queue';
import { localStore } from '../db/schema';
import { MenuItem } from '../types/menu';
import {
  isLocalId,
  KitchenStatus,
  KitchenTicket,
  Order,
  OrderItem,
  OrderItemModifiers,
  OrderType,
} from '../types/order';
import { Table } from '../types/table';
import { OrderUpdatedEvent, TicketCreatedEvent } from '../types/ws';

export { isLocalId };

let localIdCounter = 0;
function newLocalId(prefix: string): string {
  localIdCounter += 1;
  return `local-${prefix}-${Date.now().toString(36)}-${localIdCounter}`;
}

/** Mirrors the backend rule: unit price = base + chosen extras. Local estimate
 * only — the server value replaces it on sync. */
function estimateUnitPrice(menuItem: MenuItem, modifiers?: OrderItemModifiers): number {
  const extras = menuItem.customization?.extraIngredients ?? [];
  const added = modifiers?.add ?? [];
  return added.reduce((total, name) => {
    const extra = extras.find((candidate) => candidate.name === name);
    return total + (extra?.price ?? 0);
  }, menuItem.price);
}

interface OrdersState {
  orders: Record<string, Order>;
  /** localId → serverId map so screens keep working across the id swap. */
  aliases: Record<string, string>;
  tickets: Record<string, KitchenTicket[]>;
  loading: boolean;
  loadError: boolean;
  pendingSyncCount: number;
  syncError: string | null;

  hydrateFromCache(): void;
  refresh(): Promise<void>;
  refreshOrder(orderId: string): Promise<void>;
  loadTickets(orderId: string): Promise<void>;

  resolveId(id: string): string;
  getOrder(id: string): Order | undefined;

  createOrderLocal(input: {
    type: OrderType;
    table?: Table;
    customerName?: string;
  }): string;
  addItemLocal(
    orderId: string,
    menuItem: MenuItem,
    quantity: number,
    modifiers?: OrderItemModifiers,
  ): void;
  updateItemLocal(
    orderId: string,
    itemId: string,
    patch: { quantity?: number; modifiers?: OrderItemModifiers },
  ): void;
  removeItemLocal(orderId: string, itemId: string): void;

  sendToKitchen(orderId: string): Promise<KitchenTicket>;
  closeOrder(orderId: string): Promise<Order>;
  markDelivered(orderId: string, itemId: string): Promise<void>;

  applyItemStatusChanged(event: {
    orderId: string;
    itemId: string;
    kitchenStatus: KitchenStatus;
    changedAt?: string;
  }): void;
  applyOrderUpdated(event: OrderUpdatedEvent): void;
  applyTicketCreated(event: TicketCreatedEvent): void;

  clearSyncError(): void;
}

function persist(order: Order): void {
  localStore.upsertOrder(order);
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: {},
  aliases: localStore.getIdAliases(),
  tickets: {},
  loading: false,
  loadError: false,
  pendingSyncCount: pendingCount(),
  syncError: null,

  hydrateFromCache() {
    const cached = localStore.getOrders();
    if (cached.length > 0) {
      set((state) => ({
        orders: {
          ...Object.fromEntries(cached.map((order) => [order.id, order])),
          ...state.orders,
        },
      }));
    }
    void drain();
  },

  async refresh() {
    set({ loading: true });
    try {
      const orders = await ordersApi.listOrders('all');
      set((state) => {
        const next: Record<string, Order> = {};
        // Keep unsynced local orders; replace everything else with the baseline.
        for (const [id, order] of Object.entries(state.orders)) {
          if (order.pendingSync && isLocalId(id)) {
            next[id] = order;
          }
        }
        for (const order of orders) {
          next[order.id] = order;
          persist(order);
        }
        return { orders: next, loading: false, loadError: false };
      });
    } catch {
      set({ loading: false, loadError: true });
    }
  },

  async refreshOrder(orderId) {
    const id = get().resolveId(orderId);
    if (isLocalId(id)) {
      return;
    }
    try {
      const order = await ordersApi.getOrder(id);
      persist(order);
      set((state) => ({ orders: { ...state.orders, [order.id]: order } }));
    } catch {
      // Keep last known local state (offline baseline).
    }
  },

  async loadTickets(orderId) {
    const id = get().resolveId(orderId);
    if (isLocalId(id)) {
      return;
    }
    try {
      const tickets = await kitchenApi.listTickets(id);
      set((state) => ({ tickets: { ...state.tickets, [id]: tickets } }));
    } catch {
      // Non-fatal: screen falls back to order items' statuses.
    }
  },

  resolveId(id) {
    return get().aliases[id] ?? id;
  },

  getOrder(id) {
    const state = get();
    return state.orders[state.resolveId(id)];
  },

  createOrderLocal({ type, table, customerName }) {
    const localId = newLocalId('order');
    const order: Order = {
      id: localId,
      type,
      tableId: table?.id ?? null,
      table: table ?? null,
      customerName: customerName || null,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      items: [],
      pendingSync: true,
    };
    persist(order);
    set((state) => ({ orders: { ...state.orders, [localId]: order } }));
    enqueue({
      kind: 'create_order',
      localId,
      input: { type, tableId: table?.id, customerName: customerName || undefined },
    });
    return localId;
  },

  addItemLocal(orderId, menuItem, quantity, modifiers) {
    const id = get().resolveId(orderId);
    const order = get().orders[id];
    if (!order) {
      return;
    }
    const localItemId = newLocalId('item');
    const item: OrderItem = {
      id: localItemId,
      orderId: id,
      menuItemId: menuItem.id,
      quantity,
      finalPrice: estimateUnitPrice(menuItem, modifiers),
      modifiers: modifiers ?? null,
      kitchenStatus: 'queued',
      kitchenTicketId: null,
      menuItem,
    };
    const updated: Order = { ...order, items: [...order.items, item] };
    persist(updated);
    set((state) => ({ orders: { ...state.orders, [id]: updated } }));
    enqueue({
      kind: 'add_item',
      orderId: id,
      localItemId,
      input: { menuItemId: menuItem.id, quantity, modifiers },
    });
  },

  updateItemLocal(orderId, itemId, patch) {
    const id = get().resolveId(orderId);
    const order = get().orders[id];
    if (!order) {
      return;
    }
    const resolvedItemId = get().resolveId(itemId);
    const updated: Order = {
      ...order,
      items: order.items.map((item) => {
        if (item.id !== resolvedItemId) {
          return item;
        }
        const nextModifiers = patch.modifiers !== undefined ? patch.modifiers : item.modifiers;
        return {
          ...item,
          quantity: patch.quantity ?? item.quantity,
          modifiers: nextModifiers,
          finalPrice:
            patch.modifiers !== undefined && item.menuItem
              ? estimateUnitPrice(item.menuItem, nextModifiers ?? undefined)
              : item.finalPrice,
        };
      }),
    };
    persist(updated);
    set((state) => ({ orders: { ...state.orders, [id]: updated } }));
    enqueue({ kind: 'update_item', orderId: id, itemId: resolvedItemId, input: patch });
  },

  removeItemLocal(orderId, itemId) {
    const id = get().resolveId(orderId);
    const order = get().orders[id];
    if (!order) {
      return;
    }
    const resolvedItemId = get().resolveId(itemId);
    const updated: Order = {
      ...order,
      items: order.items.filter((item) => item.id !== resolvedItemId),
    };
    persist(updated);
    set((state) => ({ orders: { ...state.orders, [id]: updated } }));
    enqueue({ kind: 'remove_item', orderId: id, itemId: resolvedItemId });
  },

  async sendToKitchen(orderId) {
    const id = get().resolveId(orderId);
    const ticket = await ordersApi.sendToKitchen(id);
    await get().refreshOrder(id);
    await get().loadTickets(id);
    return ticket;
  },

  async closeOrder(orderId) {
    const id = get().resolveId(orderId);
    const order = await ordersApi.closeOrder(id);
    persist(order);
    set((state) => ({ orders: { ...state.orders, [order.id]: order } }));
    return order;
  },

  async markDelivered(orderId, itemId) {
    // Server-confirmed only (HU-36): no optimistic flip, no rollback needed.
    const id = get().resolveId(orderId);
    await kitchenApi.updateItemStatus(itemId, 'delivered');
    await get().refreshOrder(id);
  },

  applyItemStatusChanged({ orderId, itemId, kitchenStatus, changedAt }) {
    const order = get().orders[orderId];
    if (!order) {
      return;
    }
    const updated: Order = {
      ...order,
      items: order.items.map((item) =>
        item.id === itemId
          ? { ...item, kitchenStatus, kitchenStatusChangedAt: changedAt ?? item.kitchenStatusChangedAt }
          : item,
      ),
    };
    persist(updated);
    set((state) => ({ orders: { ...state.orders, [orderId]: updated } }));
  },

  applyOrderUpdated({ orderId, paymentStatus, tableId, closedAt }) {
    const id = get().resolveId(orderId);
    const order = get().orders[id];
    if (!order) {
      // Order unknown on this device: there is no baseline to patch.
      void get().refreshOrder(id);
      return;
    }

    // The same event fires for "order closed" and for "item added/edited/removed"
    // (see .specs/03-api-contrato.md). Payment fields are the only reliable
    // discriminator the contract offers: a payment/close transition is fully
    // described by the payload, so it becomes a pure delta.
    const closed = closedAt != null && closedAt !== order.closedAt;
    const paid = paymentStatus !== undefined && paymentStatus !== order.paymentStatus;
    const paymentTransition = closed || paid;

    const updated: Order = {
      ...order,
      paymentStatus: paymentStatus ?? order.paymentStatus,
      closedAt: closedAt !== undefined ? closedAt : order.closedAt,
      tableId: tableId !== undefined ? tableId : order.tableId,
    };
    persist(updated);
    set((state) => ({ orders: { ...state.orders, [id]: updated } }));

    if (!paymentTransition) {
      // Item add/edit/remove: the contract does not ship the items in the
      // payload, so another device cannot learn them without a REST read.
      // Unavoidable until the server event carries the items.
      void get().refreshOrder(id);
    }
  },

  applyTicketCreated({ orderId, ticketNumber }) {
    const id = get().resolveId(orderId);
    const known = get().tickets[id] ?? [];
    if (known.some((ticket) => ticket.number === ticketNumber)) {
      return;
    }
    // KitchenTicket needs id, createdAt and its items; the event only carries
    // the number, so a full ticket cannot be built from the delta. Refetch is
    // the only way to render it (contract limitation, not a client shortcut).
    void get().loadTickets(id);
    // Items just moved to a ticket (kitchenTicketId / queued) — not in the payload.
    void get().refreshOrder(id);
  },

  clearSyncError() {
    set({ syncError: null });
  },
}));

setSyncListener({
  onSynced(result) {
    const state = useOrdersStore.getState();
    if (result.kind === 'create_order' && result.order && result.localId && result.serverId) {
      useOrdersStore.setState((current) => {
        const orders = { ...current.orders };
        const local = orders[result.localId!];
        delete orders[result.localId!];
        // Server order has no items yet if items are still queued — keep local ones.
        const merged: Order = {
          ...result.order!,
          items: result.order!.items.length > 0 ? result.order!.items : (local?.items ?? []),
          pendingSync: pendingCount() > 0 ? local?.pendingSync : undefined,
        };
        orders[result.serverId!] = merged;
        persist(merged);
        return {
          orders,
          aliases: { ...current.aliases, [result.localId!]: result.serverId! },
        };
      });
      return;
    }
    if (result.kind === 'add_item' && result.item) {
      const order = state.orders[result.item.orderId];
      if (order) {
        // A concurrent refresh() may have replaced the order with the server
        // baseline (which predates this item) — refetch instead of merging.
        const hasLocalItem = order.items.some((item) => item.id === result.localId);
        if (!hasLocalItem) {
          void state.refreshOrder(result.item.orderId);
          return;
        }
        const updated: Order = {
          ...order,
          items: order.items.map((item) =>
            item.id === result.localId ? { ...result.item!, menuItem: item.menuItem } : item,
          ),
        };
        persist(updated);
        useOrdersStore.setState((current) => ({
          orders: { ...current.orders, [updated.id]: updated },
          aliases:
            result.localId && result.serverId
              ? { ...current.aliases, [result.localId]: result.serverId }
              : current.aliases,
        }));
      }
      return;
    }
    if (result.kind === 'update_item' && result.item) {
      void state.refreshOrder(result.item.orderId);
    }
  },
  onFailed(mutation, message) {
    useOrdersStore.setState({ syncError: message });
    // Local state may now diverge from the server — reconcile with baseline.
    void useOrdersStore.getState().refresh();
  },
  onQueueChanged(size) {
    useOrdersStore.setState((current) => {
      const next: Partial<OrdersState> = { pendingSyncCount: size };
      if (size === 0) {
        // Everything synced: clear order-level pending flags.
        next.orders = Object.fromEntries(
          Object.entries(current.orders).map(([id, order]) => [
            id,
            order.pendingSync ? { ...order, pendingSync: undefined } : order,
          ]),
        );
      }
      return next;
    });
  },
});
