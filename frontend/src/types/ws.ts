import { KitchenStatus, KitchenTicket, OrderItem, PaymentStatus } from './order';
import { TableStatus } from './table';

/**
 * Server → client WebSocket payloads, mirroring ../../../.specs/03-api-contrato.md
 * ("Tempo real — WebSocket"). Keep these in sync with the contract: the client
 * applies them as deltas, so a dropped field means an avoidable REST refetch.
 */

export interface ItemStatusChangedEvent {
  orderId: string;
  itemId: string;
  kitchenStatus: KitchenStatus;
  changedAt?: string;
}

/**
 * What actually changed in the order. This is the discriminator the client
 * switches on — with it every `order.updated` event is a pure delta and needs
 * no REST read.
 */
export type OrderChange =
  | { kind: 'item_added'; item: OrderItem }
  | { kind: 'item_updated'; item: OrderItem }
  | { kind: 'item_removed'; itemId: string }
  /** send-to-kitchen: the affected items come back queued and ticketed. */
  | { kind: 'items_queued'; items: OrderItem[] }
  | { kind: 'order_created' }
  | { kind: 'order_closed' };

export interface OrderUpdatedEvent {
  orderId: string;
  paymentStatus: PaymentStatus;
  tableId?: string | null;
  tableStatus?: TableStatus;
  closedAt?: string | null;
  change: OrderChange;
}

export interface TicketCreatedEvent {
  orderId: string;
  ticketNumber: number;
  /** Full ticket (items included) so the client never refetches it. */
  ticket: KitchenTicket;
}
