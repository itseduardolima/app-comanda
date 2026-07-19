# CLAUDE.md · backend

API NestJS 11 + Prisma 6 + PostgreSQL 16, com tempo real de cozinha via Socket.IO. Prefixo global `/api`.

Leia primeiro o [`CLAUDE.md` da raiz](../CLAUDE.md) — as regras de todo o repo valem aqui também.

## Onde ler o quê

| Vou mexer em… | Leia primeiro |
|---|---|
| entidade, enum, migration | [`../.specs/02-modelo-de-dados.md`](../.specs/02-modelo-de-dados.md) |
| endpoint ou evento WS | [`../.specs/03-api-contrato.md`](../.specs/03-api-contrato.md) — **o contrato é acordo com o app**, mudar aqui quebra o frontend |
| regra de negócio de fluxo | [`../.specs/04-fluxos.md`](../.specs/04-fluxos.md) |
| camadas, guards, gateway | [`.specs/01-arquitetura.md`](.specs/01-arquitetura.md) |
| onde criar arquivo novo | [`.specs/02-organizacao-pastas.md`](.specs/02-organizacao-pastas.md) |

## Anatomia de um módulo

Um módulo Nest por domínio: `auth`, `menu`, `tables`, `orders`, `kitchen` (+ `prisma` e `common` de infra).

```
src/<dominio>/
  <dominio>.module.ts
  <dominio>.controller.ts     # só HTTP: rota, status, delegação. Zero regra de negócio.
  <dominio>.service.ts        # toda a regra de negócio
  <dominio>.service.spec.ts
  dto/                        # class-validator, uma classe por arquivo, só entrada
```

Fluxo obrigatório: **controller → service → PrismaService**. Controller não toca Prisma; service não conhece `Request`/`Response`.

## Regras que não se negociam

- **Nada instancia `PrismaClient`.** Sempre `PrismaService` injetado.
- **Dinheiro é `Int` em centavos.** `MenuItem.price`, `OrderItem.finalPrice` — nunca float, nunca `Decimal`. Formatação é problema do app.
- **Preço congela na hora do pedido.** `OrderItem.finalPrice` guarda o preço calculado (item + modificadores) no momento em que o item entrou na comanda; mudar o cardápio depois não pode alterar comanda existente. Ver `orders.service.ts` § `computeUnitPrice`.
- **Toda entrada passa por DTO** com `class-validator`. O `ValidationPipe` global é `whitelist` + `forbidNonWhitelisted` — campo não declarado no DTO vira 400. Nunca leia `req.body` cru.
- **Erros são exceções do Nest** (`NotFoundException`, `ConflictException`, `UnauthorizedException`), formatadas pelo `HttpExceptionFilter`. Não devolva `{ error: … }` na mão.
- **Auth é fechada por padrão.** `JwtAuthGuard` é `APP_GUARD` global; rota pública exige `@Public()` explícito. Operador autenticado vem do decorator `@CurrentOperator()`.
- **Nunca vaze credencial.** Resposta de auth não devolve hash de PIN; erro de PIN inválido é genérico (401 sem dizer se o usuário existe).
- **Escrita multi-tabela vai em `$transaction`.** Fechar comanda grava `paid` + `closedAt` + `closedById` e libera a mesa atomicamente; abrir comanda cria a comanda e ocupa a mesa. Nunca em chamadas soltas.
- **Liberar mesa é uma regra só**, centralizada em `tables.service.ts` — a mesa só volta a `free` quando **todas** as comandas dela fecham. Não reimplemente essa condição em outro service.
- **Sem lógica de pagamento/cobrança.** `closeOrder` marca a comanda como paga; o dinheiro é tratado fora do sistema. Fora de escopo do MVP.
- **Mudou o contrato de API? Atualize `../.specs/03-api-contrato.md` no mesmo commit** e verifique o que quebra no `frontend/src/api/` e `frontend/src/types/`.

## Comandos

```bash
docker compose up -d              # PostgreSQL 16
npx prisma migrate dev            # aplica + gera migration
npx prisma db seed
npm run start:dev                 # http://localhost:3000/api

npm run typecheck && npm run lint && npm test
npm run test:e2e                  # precisa do Postgres de pé; roda --runInBand
```

## Testes

- **Unit** (`src/**/*.service.spec.ts`): regra de negócio do service, Prisma mockado.
- **E2E** (`test/*.e2e-spec.ts`): controller de ponta a ponta com Supertest, banco real, via `test/global-setup.ts`.
- Regra de negócio nova precisa de teste que exercite o **caminho de erro**, não só o feliz — é onde estão os 400/404/409 do contrato.

## Dívidas conhecidas (não são "como deve ser")

Se você for mexer numa dessas áreas, considere corrigir em vez de imitar:

- `menu` e `tables` não têm spec de unit test nem e2e próprio.
- Sem rate limit / lockout nas rotas `@Public()` de auth (`auth.service.ts` documenta a ausência).
- `enableCors()` sem origin e gateway com `origin: '*'` — aberto para qualquer origem.
- Sem Sentry ou APM (HU-48 pendente); `HttpExceptionFilter` só formata, não reporta.
- Sem Swagger/OpenAPI — o contrato vive só no markdown.
