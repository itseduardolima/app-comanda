import * as ordersApi from '../api/orders';
import { ApiError, NetworkError } from '../api/client';
import { Order, OrderItem } from '../types/order';
import { localStore } from './schema';

/**
 * Offline mutation queue (HU-28). Every salon mutation (create order,
 * add/update/remove item) is written locally FIRST, enqueued here, then
 * drained FIFO against the REST API whenever connectivity allows.
 *
 * Deliberate exceptions — executed online-only, never queued:
 * - send-to-kitchen: the kitchen must actually receive the ticket; queueing
 *   it silently would risk food never being prepared.
 * - closeOrder / markDelivered: require server confirmation by spec
 *   (HU-36/HU-39 — no optimistic UI without rollback).
 */

export type SyncMutation =
  | { kind: 'create_order'; localId: string; input: ordersApi.CreateOrderInput }
  | { kind: 'add_item'; orderId: string; localItemId: string; input: ordersApi.AddItemInput }
  | { kind: 'update_item'; orderId: string; itemId: string; input: ordersApi.UpdateItemInput }
  | { kind: 'remove_item'; orderId: string; itemId: string };

export interface SyncResult {
  kind: SyncMutation['kind'];
  /** Server entity after a successful call (order or item). */
  order?: Order;
  item?: OrderItem;
  localId?: string;
  serverId?: string;
}

type Listener = {
  onSynced: (result: SyncResult) => void;
  onFailed: (mutation: SyncMutation, message: string) => void;
  onQueueChanged: (size: number) => void;
};

let listener: Listener | null = null;
let draining = false;

export function setSyncListener(next: Listener | null): void {
  listener = next;
}

export function pendingCount(): number {
  return localStore.queueSize();
}

export function enqueue(mutation: SyncMutation): void {
  localStore.enqueue(mutation.kind, JSON.stringify(mutation));
  listener?.onQueueChanged(localStore.queueSize());
  void drain();
}

/** Swaps a local order id for the server id in every queued payload. */
function remapQueuedOrderIds(localId: string, serverId: string): void {
  localStore.addIdAlias(localId, serverId);
  localStore.rewriteQueuePayloads((payload) =>
    payload.replaceAll(`"${localId}"`, `"${serverId}"`),
  );
}

async function execute(mutation: SyncMutation): Promise<SyncResult> {
  switch (mutation.kind) {
    case 'create_order': {
      const order = await ordersApi.createOrder(mutation.input);
      remapQueuedOrderIds(mutation.localId, order.id);
      localStore.replaceOrderId(mutation.localId, order.id);
      return { kind: mutation.kind, order, localId: mutation.localId, serverId: order.id };
    }
    case 'add_item': {
      const item = await ordersApi.addOrderItem(mutation.orderId, mutation.input);
      remapQueuedOrderIds(mutation.localItemId, item.id);
      return {
        kind: mutation.kind,
        item,
        localId: mutation.localItemId,
        serverId: item.id,
      };
    }
    case 'update_item': {
      const item = await ordersApi.updateOrderItem(mutation.orderId, mutation.itemId, mutation.input);
      return { kind: mutation.kind, item };
    }
    case 'remove_item': {
      await ordersApi.removeOrderItem(mutation.orderId, mutation.itemId);
      return { kind: mutation.kind };
    }
  }
}

/**
 * Processes the queue in FIFO order. Stops on the first network failure
 * (retried on the next trigger: new mutation, socket reconnect, app focus).
 * Business rejections (4xx) drop the entry and surface the error — they
 * would never succeed by retrying.
 */
export async function drain(): Promise<void> {
  if (draining) {
    return;
  }
  draining = true;
  try {
    for (;;) {
      const entry = localStore.nextQueueEntry();
      if (!entry) {
        break;
      }
      const mutation = JSON.parse(entry.payload) as SyncMutation;
      try {
        const result = await execute(mutation);
        localStore.deleteQueueEntry(entry.id);
        listener?.onSynced(result);
      } catch (error) {
        if (error instanceof NetworkError) {
          localStore.updateQueueEntry(entry.id, entry.attempts + 1, error.message);
          break;
        }
        const message = error instanceof ApiError ? error.message : String(error);
        localStore.deleteQueueEntry(entry.id);
        listener?.onFailed(mutation, message);
      } finally {
        listener?.onQueueChanged(localStore.queueSize());
      }
    }
  } finally {
    draining = false;
  }
}
