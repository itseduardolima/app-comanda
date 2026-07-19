import { KitchenStatus, PaymentStatus } from './order';
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

export interface OrderUpdatedEvent {
  orderId: string;
  paymentStatus: PaymentStatus;
  tableId?: string | null;
  tableStatus?: TableStatus;
  closedAt?: string | null;
}

export interface TicketCreatedEvent {
  orderId: string;
  ticketNumber: number;
}
