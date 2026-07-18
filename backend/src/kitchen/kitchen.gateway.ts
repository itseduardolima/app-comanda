import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { KitchenStatus, PaymentStatus, TableStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { AuthenticatedOperator } from '../common/types/authenticated-operator';

interface AuthenticatedSocket extends Socket {
  data: { operator?: AuthenticatedOperator };
}

export interface SubscriptionPayload {
  orderId?: string;
  tableId?: string;
}

export interface ItemStatusChangedEvent {
  orderId: string;
  itemId: string;
  kitchenStatus: KitchenStatus;
  changedAt: string;
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

const orderRoom = (orderId: string): string => `order:${orderId}`;
const tableRoom = (tableId: string): string => `table:${tableId}`;

/**
 * Real-time kitchen channel. Read-only by design: all mutations go through
 * REST; this gateway only broadcasts already-persisted state to subscribed
 * rooms (never a global broadcast). Same JWT as REST, validated on handshake.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class KitchenGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(KitchenGateway.name);

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  handleConnection(client: AuthenticatedSocket): void {
    const operator = this.wsJwtGuard.verifyClient(client);
    if (!operator) {
      this.logger.warn(`Rejected socket ${client.id}: invalid or missing JWT`);
      client.disconnect(true);
      return;
    }
    client.data.operator = operator;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ): { subscribed: string[] } {
    const rooms = this.roomsFor(payload);
    for (const room of rooms) {
      void client.join(room);
    }
    return { subscribed: rooms };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  unsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscriptionPayload,
  ): { unsubscribed: string[] } {
    const rooms = this.roomsFor(payload);
    for (const room of rooms) {
      void client.leave(room);
    }
    return { unsubscribed: rooms };
  }

  emitItemStatusChanged(event: ItemStatusChangedEvent): void {
    this.server.to(orderRoom(event.orderId)).emit('item.status.changed', event);
  }

  emitOrderUpdated(event: OrderUpdatedEvent): void {
    const rooms = [orderRoom(event.orderId)];
    if (event.tableId) {
      rooms.push(tableRoom(event.tableId));
    }
    this.server.to(rooms).emit('order.updated', event);
  }

  emitTicketCreated(event: TicketCreatedEvent): void {
    this.server.to(orderRoom(event.orderId)).emit('kitchen.ticket.created', event);
  }

  private roomsFor(payload: SubscriptionPayload | undefined): string[] {
    const rooms: string[] = [];
    if (payload?.orderId) {
      rooms.push(orderRoom(payload.orderId));
    }
    if (payload?.tableId) {
      rooms.push(tableRoom(payload.tableId));
    }
    return rooms;
  }
}
