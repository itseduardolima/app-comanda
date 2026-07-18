import { KitchenStatus, KitchenTicket, OrderItem } from '../types/order';
import { request } from './client';

export function updateItemStatus(itemId: string, kitchenStatus: KitchenStatus): Promise<OrderItem> {
  return request<OrderItem>(`/kitchen/items/${itemId}`, {
    method: 'PATCH',
    body: { kitchenStatus },
  });
}

export function listTickets(orderId?: string): Promise<KitchenTicket[]> {
  const query = orderId ? `?orderId=${orderId}` : '';
  return request<KitchenTicket[]>(`/kitchen/tickets${query}`);
}
