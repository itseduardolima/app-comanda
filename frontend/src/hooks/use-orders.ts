import { useEffect, useMemo } from 'react';
import { OrderListFilter } from '../api/orders';
import { useOrdersStore } from '../store/orders.store';
import { Order } from '../types/order';

/** Orders list for screen 01, filtered like the API (open | paid | all). */
export function useOrders(filter: OrderListFilter) {
  const orders = useOrdersStore((state) => state.orders);
  const loading = useOrdersStore((state) => state.loading);
  const loadError = useOrdersStore((state) => state.loadError);
  const pendingSyncCount = useOrdersStore((state) => state.pendingSyncCount);
  const refresh = useOrdersStore((state) => state.refresh);
  const hydrateFromCache = useOrdersStore((state) => state.hydrateFromCache);

  useEffect(() => {
    hydrateFromCache();
    void refresh();
  }, [hydrateFromCache, refresh]);

  const list = useMemo(() => {
    const all = Object.values(orders).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (filter === 'open') {
      return all.filter((order) => order.paymentStatus === 'unpaid');
    }
    if (filter === 'paid') {
      return all.filter((order) => order.paymentStatus === 'paid');
    }
    return all;
  }, [orders, filter]);

  return { orders: list, loading, loadError, pendingSyncCount, refresh };
}

/** Single order for detail/kitchen screens (resolves local→server ids). */
export function useOrder(orderId: string): {
  order: Order | undefined;
  refresh: () => Promise<void>;
} {
  const order = useOrdersStore((state) => state.getOrder(orderId));
  const refreshOrder = useOrdersStore((state) => state.refreshOrder);

  useEffect(() => {
    void refreshOrder(orderId);
  }, [orderId, refreshOrder]);

  return { order, refresh: () => refreshOrder(orderId) };
}

/** Optional variant for screens where the order context may be absent
 * (e.g. Cardápio browsing without an open comanda). */
export function useOrderOptional(orderId?: string): Order | undefined {
  return useOrdersStore((state) => (orderId ? state.getOrder(orderId) : undefined));
}

/** Mutation and lookup actions — the only door screens use to change orders
 * (frontend/.specs: tela → hook → store, never tela → store/api). */
export function useOrderActions() {
  const createOrderLocal = useOrdersStore((state) => state.createOrderLocal);
  const addItemLocal = useOrdersStore((state) => state.addItemLocal);
  const updateItemLocal = useOrdersStore((state) => state.updateItemLocal);
  const removeItemLocal = useOrdersStore((state) => state.removeItemLocal);
  const sendToKitchen = useOrdersStore((state) => state.sendToKitchen);
  const closeOrder = useOrdersStore((state) => state.closeOrder);
  const markDelivered = useOrdersStore((state) => state.markDelivered);
  const resolveId = useOrdersStore((state) => state.resolveId);

  return {
    createOrderLocal,
    addItemLocal,
    updateItemLocal,
    removeItemLocal,
    sendToKitchen,
    closeOrder,
    markDelivered,
    resolveId,
  };
}

/** Kitchen tickets of an order (baseline for screens 4A–4D). */
export function useKitchenTickets(orderId: string) {
  const resolveId = useOrdersStore((state) => state.resolveId);
  const tickets = useOrdersStore((state) => state.tickets[state.resolveId(orderId)] ?? []);
  const loadTickets = useOrdersStore((state) => state.loadTickets);

  useEffect(() => {
    void loadTickets(orderId);
  }, [orderId, loadTickets]);

  return { tickets, resolveId };
}
