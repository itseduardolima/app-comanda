import { execSync } from 'node:child_process';

const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  'postgresql://app_comanda:app_comanda@localhost:5432/app_comanda_test?schema=public';

/** Applies migrations to the test database before the e2e suite runs. */
export default function globalSetup(): void {
  execSync('npx prisma migrate deploy', {
    cwd: `${__dirname}/..`,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}
