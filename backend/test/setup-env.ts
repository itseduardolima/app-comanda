/**
 * E2E environment: points Prisma at the dedicated test database so e2e runs
 * never touch dev data. Migrations are applied by `test/global-setup.ts`.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  'postgresql://app_comanda:app_comanda@localhost:5432/app_comanda_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-test-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
