import { MenuItem } from './menu';
import { Table } from './table';

/** Enums mirror .specs/02-modelo-de-dados.md — values in English, UI translates. */
export type OrderType = 'dine_in' | 'counter' | 'delivery';
export type PaymentStatus = 'unpaid' | 'paid';
export type KitchenStatus = 'queued' | 'preparing' | 'ready' | 'delivered';

export const KITCHEN_STATUS_SEQUENCE: KitchenStatus[] = [
  'queued',
  'preparing',
  'ready',
  'delivered',
];

export type MeatPoint = 'mal_passado' | 'ao_ponto' | 'bem_passado';

/** Free-form by contract; these are the keys the app writes. */
export interface OrderItemModifiers {
  point?: MeatPoint;
  remove?: string[];
  add?: string[];
  note?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  /** Unit price in cents, frozen at ordering time. */
  finalPrice: number;
  modifiers?: OrderItemModifiers | null;
  kitchenStatus: KitchenStatus;
  kitchenStatusChangedAt?: string | null;
  kitchenTicketId?: string | null;
  menuItem?: MenuItem;
}

export interface OperatorRef {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  type: OrderType;
  tableId?: string | null;
  table?: Table | null;
  customerName?: string | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
  closedAt?: string | null;
  operator?: OperatorRef;
  closedBy?: OperatorRef | null;
  items: OrderItem[];
  /** Local-only flag: true while the entity has mutations waiting to sync. */
  pendingSync?: boolean;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  number: number;
  createdAt: string;
  items: OrderItem[];
}

/** Order total in cents = Σ quantity × finalPrice (unit). */
export function orderTotal(order: Pick<Order, 'items'>): number {
  return order.items.reduce((total, item) => total + item.quantity * item.finalPrice, 0);
}
