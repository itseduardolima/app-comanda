import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MenuItem, Operator, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { io, type Socket as ClientSocket } from 'socket.io-client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

const OPERATOR_USERNAME = 'kitchen-e2e-operator';
const OPERATOR_NAME = 'Kitchen E2E Operator';
const PIZZA_NAME = 'E2E Kitchen Pizza';
const JUICE_NAME = 'E2E Kitchen Juice';

interface AuthResponse {
  accessToken: string;
  operator: { id: string; name: string };
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

interface KitchenItemResponse {
  id: string;
  quantity: number;
  kitchenStatus: string;
  kitchenTicketId: string | null;
  kitchenStatusChangedAt: string | null;
  menuItem: { id: string; name: string };
}

interface TicketResponse {
  id: string;
  orderId: string;
  number: number;
  items: KitchenItemResponse[];
}

interface ItemStatusChangedEvent {
  orderId: string;
  itemId: string;
  kitchenStatus: string;
  changedAt: string;
}

interface TicketCreatedEvent {
  orderId: string;
  ticketNumber: number;
  ticket: TicketResponse;
}

interface OrderUpdatedEvent {
  orderId: string;
  paymentStatus: string;
  tableId?: string | null;
  change: { kind: string; items?: KitchenItemResponse[] };
}

function waitForEvent<T = unknown>(
  socket: ClientSocket,
  event: string,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for socket event "${event}"`)),
      timeoutMs,
    );
    socket.once(event, (...args: unknown[]) => {
      clearTimeout(timer);
      resolve(args[0] as T);
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Kitchen (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let baseUrl: string;
  let prisma: PrismaClient;
  let operator: Operator;
  let pizza: MenuItem;
  let juice: MenuItem;
  let token: string;
  let orderId: string;

  let itemAId: string;
  let itemBId: string;
  let itemCId: string;
  let ticket1Number: number;

  const sockets: ClientSocket[] = [];

  const authHeader = (): [string, string] => ['Authorization', `Bearer ${token}`];

  function connectSocket(authToken: string): ClientSocket {
    const socket = io(baseUrl, {
      auth: { token: authToken },
      transports: ['websocket'],
      reconnection: false,
      timeout: 5000,
    });
    sockets.push(socket);
    return socket;
  }

  async function cleanDatabase(): Promise<void> {
    await prisma.orderItem.deleteMany();
    await prisma.kitchenTicket.deleteMany();
    await prisma.order.deleteMany();
    await prisma.operator.deleteMany({ where: { username: OPERATOR_USERNAME } });
    await prisma.menuItem.deleteMany({ where: { name: { in: [PIZZA_NAME, JUICE_NAME] } } });
  }

  async function addItem(menuItemId: string, quantity = 1): Promise<string> {
    const res = await request(server)
      .post(`/api/orders/${orderId}/items`)
      .set(...authHeader())
      .send({ menuItemId, quantity })
      .expect(201);
    return (res.body as KitchenItemResponse).id;
  }

  beforeAll(async () => {
    prisma = new PrismaClient();
    await cleanDatabase();

    operator = await prisma.operator.create({
      data: { username: OPERATOR_USERNAME, name: OPERATOR_NAME },
    });
    pizza = await prisma.menuItem.create({
      data: { name: PIZZA_NAME, price: 4500, category: 'pizzas' },
    });
    juice = await prisma.menuItem.create({
      data: { name: JUICE_NAME, price: 900, category: 'drinks' },
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    // Listen on an ephemeral port so socket.io clients can connect for the WS tests.
    await app.listen(0);
    server = app.getHttpServer() as Server;
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    await request(server)
      .post('/api/auth/pin/create')
      .send({ operatorId: operator.id, pin: '2468' })
      .expect(201);
    const verifyRes = await request(server)
      .post('/api/auth/pin/verify')
      .send({ operatorId: operator.id, pin: '2468' })
      .expect(200);
    token = (verifyRes.body as AuthResponse).accessToken;

    const orderRes = await request(server)
      .post('/api/orders')
      .set(...authHeader())
      .send({ type: 'counter', customerName: 'Kitchen E2E' })
      .expect(201);
    orderId = (orderRes.body as { id: string }).id;
  });

  afterAll(async () => {
    for (const socket of sockets) {
      socket.disconnect();
    }
    await cleanDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  it('rejects send-to-kitchen for an order with no items with 400', async () => {
    const res = await request(server)
      .post(`/api/orders/${orderId}/send-to-kitchen`)
      .set(...authHeader())
      .expect(400);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Cannot send an order with no items to the kitchen');
  });

  it('creates a ticket with a sequential number and queues the pending items', async () => {
    itemAId = await addItem(pizza.id);
    itemBId = await addItem(juice.id, 2);

    const res = await request(server)
      .post(`/api/orders/${orderId}/send-to-kitchen`)
      .set(...authHeader())
      .expect(201);

    const ticket = res.body as TicketResponse;
    ticket1Number = ticket.number;
    expect(typeof ticket.number).toBe('number');
    expect(ticket.orderId).toBe(orderId);
    expect(ticket.items).toHaveLength(2);
    expect(ticket.items.map((item) => item.id).sort()).toEqual([itemAId, itemBId].sort());
    expect(ticket.items.every((item) => item.kitchenStatus === 'queued')).toBe(true);
    expect(ticket.items.every((item) => item.kitchenTicketId === ticket.id)).toBe(true);
  });

  it('rejects re-sending when every item was already sent with 400', async () => {
    const res = await request(server)
      .post(`/api/orders/${orderId}/send-to-kitchen`)
      .set(...authHeader())
      .expect(400);

    const body = res.body as ErrorResponse;
    expect(body.message).toBe('All items were already sent to the kitchen');
  });

  it('creates a second ticket containing only the newly added item', async () => {
    itemCId = await addItem(pizza.id);

    const res = await request(server)
      .post(`/api/orders/${orderId}/send-to-kitchen`)
      .set(...authHeader())
      .expect(201);

    const ticket = res.body as TicketResponse;
    expect(ticket.number).toBe(ticket1Number + 1);
    expect(ticket.items).toHaveLength(1);
    expect(ticket.items[0].id).toBe(itemCId);
    expect(ticket.items[0].kitchenStatus).toBe('queued');
  });

  it('rejects an invalid kitchen status transition (queued -> ready) with 400', async () => {
    const res = await request(server)
      .patch(`/api/kitchen/items/${itemAId}`)
      .set(...authHeader())
      .send({ kitchenStatus: 'ready' })
      .expect(400);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Invalid kitchen status transition: queued → ready');
  });

  it('walks an item through queued -> preparing -> ready -> delivered', async () => {
    for (const next of ['preparing', 'ready', 'delivered']) {
      const res = await request(server)
        .patch(`/api/kitchen/items/${itemAId}`)
        .set(...authHeader())
        .send({ kitchenStatus: next })
        .expect(200);

      const item = res.body as KitchenItemResponse;
      expect(item.kitchenStatus).toBe(next);
      expect(item.kitchenStatusChangedAt).toEqual(expect.any(String));
    }
  });

  it('returns 404 for an unknown kitchen item', async () => {
    const res = await request(server)
      .patch(`/api/kitchen/items/${randomUUID()}`)
      .set(...authHeader())
      .send({ kitchenStatus: 'preparing' })
      .expect(404);

    const body = res.body as ErrorResponse;
    expect(body).toEqual({ statusCode: 404, message: 'Order item not found', error: 'Not Found' });
  });

  it('lists the order tickets with their items via GET /api/kitchen/tickets?orderId=', async () => {
    const res = await request(server)
      .get('/api/kitchen/tickets')
      .query({ orderId })
      .set(...authHeader())
      .expect(200);

    const tickets = res.body as TicketResponse[];
    expect(tickets).toHaveLength(2);
    expect(tickets[0].number).toBe(ticket1Number);
    expect(tickets[1].number).toBe(ticket1Number + 1);
    expect(tickets[0].items).toHaveLength(2);
    expect(tickets[1].items).toHaveLength(1);
    expect(tickets[1].items[0].menuItem.name).toBe(PIZZA_NAME);
  });

  describe('WebSocket gateway', () => {
    it('accepts a socket.io connection with a valid JWT', async () => {
      const socket = connectSocket(token);
      await waitForEvent(socket, 'connect');
      await sleep(150);
      expect(socket.connected).toBe(true);
      socket.disconnect();
    });

    it('disconnects a socket.io connection with an invalid JWT', async () => {
      const socket = connectSocket('this-is-not-a-jwt');
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Timed out waiting for the socket to be rejected')),
          5000,
        );
        const settle = (): void => {
          clearTimeout(timer);
          resolve();
        };
        socket.once('disconnect', settle);
        socket.once('connect_error', settle);
      });
      await sleep(50);
      expect(socket.connected).toBe(false);
    });

    it('emits item.status.changed to order subscribers when an item is updated via REST', async () => {
      const socket = connectSocket(token);
      await waitForEvent(socket, 'connect');

      const ack = await new Promise<{ subscribed: string[] }>((resolve) => {
        socket.emit('subscribe', { orderId }, (response: { subscribed: string[] }) =>
          resolve(response),
        );
      });
      expect(ack.subscribed).toEqual([`order:${orderId}`]);

      const eventPromise = waitForEvent<ItemStatusChangedEvent>(socket, 'item.status.changed');
      await request(server)
        .patch(`/api/kitchen/items/${itemBId}`)
        .set(...authHeader())
        .send({ kitchenStatus: 'preparing' })
        .expect(200);

      const event = await eventPromise;
      expect(event.orderId).toBe(orderId);
      expect(event.itemId).toBe(itemBId);
      expect(event.kitchenStatus).toBe('preparing');
      expect(event.changedAt).toEqual(expect.any(String));
      socket.disconnect();
    });

    it('emits kitchen.ticket.created with the full ticket and order.updated with items_queued', async () => {
      const socket = connectSocket(token);
      await waitForEvent(socket, 'connect');
      await new Promise<void>((resolve) => {
        socket.emit('subscribe', { orderId }, () => resolve());
      });

      const newItemId = await addItem(juice.id, 3);
      const ticketPromise = waitForEvent<TicketCreatedEvent>(socket, 'kitchen.ticket.created');
      const orderUpdatedPromise = waitForEvent<OrderUpdatedEvent>(socket, 'order.updated');

      const res = await request(server)
        .post(`/api/orders/${orderId}/send-to-kitchen`)
        .set(...authHeader())
        .expect(201);
      const created = res.body as TicketResponse;

      const ticketEvent = await ticketPromise;
      expect(ticketEvent.orderId).toBe(orderId);
      expect(ticketEvent.ticketNumber).toBe(created.number);
      // The whole ticket rides on the event, items included, so the client
      // never needs a REST call to apply the delta (HU-32).
      expect(ticketEvent.ticket.id).toBe(created.id);
      expect(ticketEvent.ticket.number).toBe(created.number);
      expect(ticketEvent.ticket.items).toHaveLength(1);
      expect(ticketEvent.ticket.items[0].id).toBe(newItemId);
      expect(ticketEvent.ticket.items[0].kitchenStatus).toBe('queued');
      expect(ticketEvent.ticket.items[0].menuItem.name).toBe(JUICE_NAME);

      const orderEvent = await orderUpdatedPromise;
      expect(orderEvent.orderId).toBe(orderId);
      expect(orderEvent.paymentStatus).toBe('unpaid');
      expect(orderEvent.change.kind).toBe('items_queued');
      expect(orderEvent.change.items?.map((item) => item.id)).toEqual([newItemId]);
      socket.disconnect();
    });
  });
});
