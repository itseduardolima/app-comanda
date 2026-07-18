import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MenuItem, Operator, PrismaClient, Table } from '@prisma/client';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

const OPERATOR_USERNAME = 'orders-e2e-operator';
const OPERATOR_NAME = 'Orders E2E Operator';
const TABLE_A_NUMBER = 9101;
const TABLE_B_NUMBER = 9102;
const BURGER_NAME = 'E2E Orders Burger';
const SODA_NAME = 'E2E Orders Soda';
const BURGER_PRICE = 3000;
const SODA_PRICE = 800;
const BACON_PRICE = 500;

interface AuthResponse {
  accessToken: string;
  operator: { id: string; name: string };
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

interface OperatorRef {
  id: string;
  name: string;
}

interface OrderItemResponse {
  id: string;
  quantity: number;
  finalPrice: number;
  kitchenStatus: string;
  kitchenTicketId: string | null;
  modifiers: Record<string, unknown> | null;
  menuItem: { id: string; name: string; price: number };
}

interface OrderResponse {
  id: string;
  type: string;
  paymentStatus: string;
  closedAt: string | null;
  operator: OperatorRef;
  closedBy: OperatorRef | null;
  table: { id: string; number: number } | null;
  items: OrderItemResponse[];
}

interface TableResponse {
  id: string;
  number: number;
  status: string;
}

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaClient;
  let operator: Operator;
  let tableA: Table;
  let burger: MenuItem;
  let soda: MenuItem;
  let token: string;

  let order1Id: string;
  let order2Id: string;
  let burgerItemId: string;

  const authHeader = (): [string, string] => ['Authorization', `Bearer ${token}`];

  async function cleanDatabase(): Promise<void> {
    await prisma.orderItem.deleteMany();
    await prisma.kitchenTicket.deleteMany();
    await prisma.order.deleteMany();
    await prisma.operator.deleteMany({ where: { username: OPERATOR_USERNAME } });
    await prisma.table.deleteMany({ where: { number: { in: [TABLE_A_NUMBER, TABLE_B_NUMBER] } } });
    await prisma.menuItem.deleteMany({ where: { name: { in: [BURGER_NAME, SODA_NAME] } } });
  }

  async function getTable(number: number): Promise<TableResponse> {
    const res = await request(server).get('/api/tables').set(...authHeader()).expect(200);
    const tables = res.body as TableResponse[];
    const table = tables.find((candidate) => candidate.number === number);
    expect(table).toBeDefined();
    return table as TableResponse;
  }

  beforeAll(async () => {
    prisma = new PrismaClient();
    await cleanDatabase();

    operator = await prisma.operator.create({
      data: { username: OPERATOR_USERNAME, name: OPERATOR_NAME },
    });
    tableA = await prisma.table.create({ data: { number: TABLE_A_NUMBER } });
    await prisma.table.create({ data: { number: TABLE_B_NUMBER } });
    burger = await prisma.menuItem.create({
      data: {
        name: BURGER_NAME,
        price: BURGER_PRICE,
        category: 'burgers',
        customization: {
          removableIngredients: ['onion'],
          extraIngredients: [{ name: 'Bacon', price: BACON_PRICE }],
        },
      },
    });
    soda = await prisma.menuItem.create({
      data: { name: SODA_NAME, price: SODA_PRICE, category: 'drinks' },
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    server = app.getHttpServer() as Server;

    await request(server)
      .post('/api/auth/pin/create')
      .send({ operatorId: operator.id, pin: '4321' })
      .expect(201);
    const verifyRes = await request(server)
      .post('/api/auth/pin/verify')
      .send({ operatorId: operator.id, pin: '4321' })
      .expect(200);
    token = (verifyRes.body as AuthResponse).accessToken;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  it('rejects a dine_in order without tableId with 400', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set(...authHeader())
      .send({ type: 'dine_in' })
      .expect(400);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(400);
    expect(Array.isArray(body.message)).toBe(true);
  });

  it('creates a dine_in order and marks the table as occupied', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set(...authHeader())
      .send({ type: 'dine_in', tableId: tableA.id, customerName: 'João' })
      .expect(201);

    const body = res.body as OrderResponse;
    order1Id = body.id;
    expect(body.type).toBe('dine_in');
    expect(body.paymentStatus).toBe('unpaid');
    expect(body.table?.id).toBe(tableA.id);
    expect(body.operator).toEqual({ id: operator.id, name: OPERATOR_NAME });

    const occupied = await getTable(TABLE_A_NUMBER);
    expect(occupied.status).toBe('occupied');
    const untouched = await getTable(TABLE_B_NUMBER);
    expect(untouched.status).toBe('free');
  });

  it('allows a second order on the same table (split comanda)', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set(...authHeader())
      .send({ type: 'dine_in', tableId: tableA.id, customerName: 'Maria' })
      .expect(201);

    order2Id = (res.body as OrderResponse).id;
    expect(order2Id).not.toBe(order1Id);

    const table = await getTable(TABLE_A_NUMBER);
    expect(table.status).toBe('occupied');
  });

  it('adds an item with an extra ingredient and includes the extra price in finalPrice', async () => {
    const res = await request(server)
      .post(`/api/orders/${order1Id}/items`)
      .set(...authHeader())
      .send({
        menuItemId: burger.id,
        quantity: 1,
        modifiers: { add: ['Bacon'], remove: ['onion'], note: 'no salt' },
      })
      .expect(201);

    const item = res.body as OrderItemResponse;
    burgerItemId = item.id;
    expect(item.finalPrice).toBe(BURGER_PRICE + BACON_PRICE);
    expect(item.quantity).toBe(1);
    expect(item.kitchenStatus).toBe('queued');
    expect(item.menuItem.id).toBe(burger.id);
  });

  it('updates an item quantity via PATCH', async () => {
    const res = await request(server)
      .patch(`/api/orders/${order1Id}/items/${burgerItemId}`)
      .set(...authHeader())
      .send({ quantity: 3 })
      .expect(200);

    const item = res.body as OrderItemResponse;
    expect(item.quantity).toBe(3);
    expect(item.finalPrice).toBe(BURGER_PRICE + BACON_PRICE);
  });

  it('deletes an item from an order', async () => {
    const addRes = await request(server)
      .post(`/api/orders/${order1Id}/items`)
      .set(...authHeader())
      .send({ menuItemId: soda.id, quantity: 2 })
      .expect(201);
    const sodaItemId = (addRes.body as OrderItemResponse).id;

    await request(server)
      .delete(`/api/orders/${order1Id}/items/${sodaItemId}`)
      .set(...authHeader())
      .expect(204);

    const orderRes = await request(server)
      .get(`/api/orders/${order1Id}`)
      .set(...authHeader())
      .expect(200);
    const order = orderRes.body as OrderResponse;
    expect(order.items).toHaveLength(1);
    expect(order.items[0].id).toBe(burgerItemId);
  });

  it('filters orders by status open/paid/all', async () => {
    const openRes = await request(server)
      .get('/api/orders')
      .query({ status: 'open' })
      .set(...authHeader())
      .expect(200);
    const openIds = (openRes.body as OrderResponse[]).map((order) => order.id);
    expect(openIds).toEqual(expect.arrayContaining([order1Id, order2Id]));

    const paidRes = await request(server)
      .get('/api/orders')
      .query({ status: 'paid' })
      .set(...authHeader())
      .expect(200);
    expect(paidRes.body as OrderResponse[]).toHaveLength(0);

    const allRes = await request(server)
      .get('/api/orders')
      .query({ status: 'all' })
      .set(...authHeader())
      .expect(200);
    const allIds = (allRes.body as OrderResponse[]).map((order) => order.id);
    expect(allIds).toEqual(expect.arrayContaining([order1Id, order2Id]));
  });

  it('rejects an unknown status filter with 400', async () => {
    const res = await request(server)
      .get('/api/orders')
      .query({ status: 'bogus' })
      .set(...authHeader())
      .expect(400);

    expect((res.body as ErrorResponse).statusCode).toBe(400);
  });

  it('returns 404 for an unknown order id', async () => {
    const res = await request(server)
      .get(`/api/orders/${randomUUID()}`)
      .set(...authHeader())
      .expect(404);

    const body = res.body as ErrorResponse;
    expect(body).toEqual({ statusCode: 404, message: 'Order not found', error: 'Not Found' });
  });

  it('lists only open orders of a table', async () => {
    const res = await request(server)
      .get(`/api/tables/${tableA.id}/orders`)
      .set(...authHeader())
      .expect(200);

    const orders = res.body as OrderResponse[];
    expect(orders.map((order) => order.id).sort()).toEqual([order1Id, order2Id].sort());
    expect(orders.every((order) => order.paymentStatus === 'unpaid')).toBe(true);
  });

  it('closes an order: paid, closedAt and closedBy stamped; table stays occupied while another order is open (HU-41)', async () => {
    const res = await request(server)
      .post(`/api/orders/${order1Id}/close`)
      .set(...authHeader())
      .expect(200);

    const closed = res.body as OrderResponse;
    expect(closed.paymentStatus).toBe('paid');
    expect(closed.closedAt).toEqual(expect.any(String));
    expect(closed.closedBy).toEqual({ id: operator.id, name: OPERATOR_NAME });

    // João paid, Maria's order is still open on the same table.
    const table = await getTable(TABLE_A_NUMBER);
    expect(table.status).toBe('occupied');
  });

  it('returns 409 when closing an already paid order', async () => {
    const res = await request(server)
      .post(`/api/orders/${order1Id}/close`)
      .set(...authHeader())
      .expect(409);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(409);
    expect(body.message).toBe('Order is already paid');
  });

  it('no longer lists the paid order among the table open orders', async () => {
    const res = await request(server)
      .get(`/api/tables/${tableA.id}/orders`)
      .set(...authHeader())
      .expect(200);

    const orders = res.body as OrderResponse[];
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(order2Id);
  });

  it('frees the table when its last open order is closed (HU-41)', async () => {
    await request(server)
      .post(`/api/orders/${order2Id}/close`)
      .set(...authHeader())
      .expect(200);

    const table = await getTable(TABLE_A_NUMBER);
    expect(table.status).toBe('free');

    const paidRes = await request(server)
      .get('/api/orders')
      .query({ status: 'paid' })
      .set(...authHeader())
      .expect(200);
    const paidIds = (paidRes.body as OrderResponse[]).map((order) => order.id);
    expect(paidIds).toEqual(expect.arrayContaining([order1Id, order2Id]));

    const openRes = await request(server)
      .get('/api/orders')
      .query({ status: 'open' })
      .set(...authHeader())
      .expect(200);
    expect(openRes.body as OrderResponse[]).toHaveLength(0);
  });
});
