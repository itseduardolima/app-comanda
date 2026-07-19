import {
  KitchenTicket,
  Order,
  OrderItem,
  OrderItemModifiers,
  OrderListFilter,
  OrderType,
} from '../types/order';
import { request } from './client';

export type { OrderListFilter };

export interface CreateOrderInput {
  type: OrderType;
  tableId?: string;
  customerName?: string;
}

export interface AddItemInput {
  menuItemId: string;
  quantity: number;
  modifiers?: OrderItemModifiers;
}

export interface UpdateItemInput {
  quantity?: number;
  modifiers?: OrderItemModifiers;
}

export function listOrders(status: OrderListFilter = 'all'): Promise<Order[]> {
  return request<Order[]>(`/orders?status=${status}`);
}

export function getOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return request<Order>('/orders', { method: 'POST', body: input });
}

export function addOrderItem(orderId: string, input: AddItemInput): Promise<OrderItem> {
  return request<OrderItem>(`/orders/${orderId}/items`, { method: 'POST', body: input });
}

export function updateOrderItem(
  orderId: string,
  itemId: string,
  input: UpdateItemInput,
): Promise<OrderItem> {
  return request<OrderItem>(`/orders/${orderId}/items/${itemId}`, {
    method: 'PATCH',
    body: input,
  });
}

export function removeOrderItem(orderId: string, itemId: string): Promise<void> {
  return request<void>(`/orders/${orderId}/items/${itemId}`, { method: 'DELETE' });
}

export function closeOrder(orderId: string): Promise<Order> {
  return request<Order>(`/orders/${orderId}/close`, { method: 'POST' });
}

export function sendToKitchen(orderId: string): Promise<KitchenTicket> {
  return request<KitchenTicket>(`/orders/${orderId}/send-to-kitchen`, { method: 'POST' });
}
