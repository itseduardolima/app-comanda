import { useEffect, useState } from 'react';
import { isLocalId, useOrdersStore } from '../store/orders.store';
import { isSocketConnected, onConnectionChange, subscribe, unsubscribe } from './client';

/**
 * Screen-level subscription to an order's realtime room. Joins on mount,
 * leaves on unmount (HU-32) and exposes connection state so screens can show
 * a discreet "reconnecting" hint (HU-33).
 */
export function useKitchenSocket(orderId?: string, tableId?: string): { connected: boolean } {
  const resolveId = useOrdersStore((state) => state.resolveId);
  const [connected, setConnected] = useState(isSocketConnected());
  const resolvedOrderId = orderId ? resolveId(orderId) : undefined;

  useEffect(() => {
    const serverOrderId = resolvedOrderId && !isLocalId(resolvedOrderId) ? resolvedOrderId : undefined;
    if (!serverOrderId && !tableId) {
      return;
    }
    const subscription = { orderId: serverOrderId, tableId };
    subscribe(subscription);
    return () => unsubscribe(subscription);
  }, [resolvedOrderId, tableId]);

  useEffect(() => onConnectionChange(setConnected), []);

  return { connected };
}
