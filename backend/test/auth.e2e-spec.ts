import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Operator, PrismaClient } from '@prisma/client';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

const OPERATOR_USERNAME = 'auth-e2e-operator';
const OPERATOR_NAME = 'Auth E2E Operator';

interface AuthResponse {
  accessToken: string;
  operator: { id: string; name: string };
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaClient;
  let operator: Operator;

  async function cleanDatabase(): Promise<void> {
    await prisma.orderItem.deleteMany();
    await prisma.kitchenTicket.deleteMany();
    await prisma.order.deleteMany();
    await prisma.operator.deleteMany({ where: { username: OPERATOR_USERNAME } });
  }

  beforeAll(async () => {
    prisma = new PrismaClient();
    await cleanDatabase();
    operator = await prisma.operator.create({
      data: { username: OPERATOR_USERNAME, name: OPERATOR_NAME },
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
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /api/auth/login returns 404 with the contract error shape for an unknown username', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'ghost-user-that-does-not-exist' })
      .expect(404);

    const body = res.body as ErrorResponse;
    expect(body).toEqual({
      statusCode: 404,
      message: 'Operator not found',
      error: 'Not Found',
    });
  });

  it('POST /api/auth/login returns pinSet false for an operator without a PIN', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: OPERATOR_USERNAME })
      .expect(200);

    expect(res.body).toEqual({ operatorId: operator.id, pinSet: false });
  });

  it('POST /api/auth/pin/create rejects a non-numeric PIN with 400', async () => {
    const res = await request(server)
      .post('/api/auth/pin/create')
      .send({ operatorId: operator.id, pin: '12ab' })
      .expect(400);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(400);
    expect(body.message).toContain('pin must be exactly 4 numeric digits');
  });

  it('POST /api/auth/pin/create sets the PIN and returns 201 with an access token', async () => {
    const res = await request(server)
      .post('/api/auth/pin/create')
      .send({ operatorId: operator.id, pin: '1234' })
      .expect(201);

    const body = res.body as AuthResponse;
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(0);
    expect(body.operator).toEqual({ id: operator.id, name: OPERATOR_NAME });
  });

  it('POST /api/auth/pin/create returns 409 when the PIN is already set', async () => {
    const res = await request(server)
      .post('/api/auth/pin/create')
      .send({ operatorId: operator.id, pin: '5678' })
      .expect(409);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(409);
    expect(body.message).toBe('PIN already set for this operator');
  });

  it('POST /api/auth/pin/verify returns 401 for a wrong PIN', async () => {
    const res = await request(server)
      .post('/api/auth/pin/verify')
      .send({ operatorId: operator.id, pin: '9999' })
      .expect(401);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(401);
    expect(body.message).toBe('Invalid credentials');
  });

  it('POST /api/auth/pin/verify returns 200 with an access token for the correct PIN', async () => {
    const res = await request(server)
      .post('/api/auth/pin/verify')
      .send({ operatorId: operator.id, pin: '1234' })
      .expect(200);

    const body = res.body as AuthResponse;
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(0);
    expect(body.operator).toEqual({ id: operator.id, name: OPERATOR_NAME });
  });

  it('rejects a protected route without a token with 401', async () => {
    const res = await request(server).get('/api/tables').expect(401);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(401);
  });

  it('rejects an unknown extra field in the body with 400 (forbidNonWhitelisted)', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: OPERATOR_USERNAME, extra: 'should-not-be-here' })
      .expect(400);

    const body = res.body as ErrorResponse;
    expect(body.statusCode).toBe(400);
    expect(body.message).toContain('property extra should not exist');
  });
});
