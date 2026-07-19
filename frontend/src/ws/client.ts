import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';
import { drain } from '../db/sync-queue';
import { useOrdersStore } from '../store/orders.store';
import { useTablesStore } from '../store/tables.store';
import { ItemStatusChangedEvent, OrderUpdatedEvent, TicketCreatedEvent } from '../types/ws';

/**
 * Single Socket.IO connection per app session (HU-32). Authenticated with
 * the same REST JWT in the handshake. Events received are deltas applied
 * straight to the stores; on every (re)connect the app refetches the REST
 * baseline before trusting deltas again (HU-33).
 */

const extra = (Constants.expoConfig?.extra ?? {}) as { wsUrl?: string };
export const WS_URL = extra.wsUrl ?? 'http://localhost:3000';

type Subscription = { orderId?: string; tableId?: string };

let socket: Socket | null = null;
const activeSubscriptions = new Map<string, Subscription>();
const connectionListeners = new Set<(connected: boolean) => void>();

function subscriptionKey(subscription: Subscription): string {
  return `${subscription.orderId ?? ''}|${subscription.tableId ?? ''}`;
}

export function onConnectionChange(listener: (connected: boolean) => void): () => void {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

function notifyConnection(connected: boolean): void {
  for (const listener of connectionListeners) {
    listener(connected);
  }
}

export function connectSocket(token: string): void {
  disconnectSocket();
  socket = io(WS_URL, {
    transports: ['websocket'],
    auth: { token },
    // socket.io-client reconnects automatically with backoff (HU-33).
    reconnection: true,
  });

  socket.on('connect', () => {
    notifyConnection(true);
    // Network is back: resubscribe rooms, resync baseline, drain offline queue.
    const store = useOrdersStore.getState();
    for (const subscription of activeSubscriptions.values()) {
      socket?.emit('subscribe', subscription);
      if (subscription.orderId) {
        void store.refreshOrder(subscription.orderId);
        void store.loadTickets(subscription.orderId);
      }
    }
    void store.refresh();
    void drain();
  });

  socket.on('disconnect', () => notifyConnection(false));

  socket.on('item.status.changed', (event: ItemStatusChangedEvent) => {
    useOrdersStore.getState().applyItemStatusChanged(event);
  });

  socket.on('order.updated', (event: OrderUpdatedEvent) => {
    useOrdersStore.getState().applyOrderUpdated(event);
    if (event.tableId && event.tableStatus) {
      // Table grid stays live without a REST read (HU-32).
      useTablesStore.getState().applyTableStatus(event.tableId, event.tableStatus);
    }
  });

  socket.on('kitchen.ticket.created', (event: TicketCreatedEvent) => {
    useOrdersStore.getState().applyTicketCreated(event);
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    notifyConnection(false);
  }
}

/** Joins the order/table rooms; tracked so reconnects resubscribe (HU-33). */
export function subscribe(subscription: Subscription): void {
  activeSubscriptions.set(subscriptionKey(subscription), subscription);
  socket?.emit('subscribe', subscription);
}

export function unsubscribe(subscription: Subscription): void {
  activeSubscriptions.delete(subscriptionKey(subscription));
  socket?.emit('unsubscribe', subscription);
}
