# Backend · App do Garçom (gerenciador de comandas)

API do app do garçom — produto **genérico** para restaurantes (marca é configuração, não fixa no código). **NestJS (Node.js + TypeScript)** + **PostgreSQL**.

> Contexto completo e contrato em [`../.specs/`](../.specs/). Este README é o guia de desenvolvimento **do backend**. Leia primeiro `../.specs/01-arquitetura.md`, `../.specs/02-modelo-de-dados.md` e `../.specs/03-api-contrato.md`.

## Papel deste serviço

Expor uma **API REST** para o app do garçom: autenticação por PIN, CRUD de comandas e itens, cardápio, mesas e status de cozinha. **Não** processa pagamento — "Fechar conta" apenas troca `payment_status` para `paid`.

## Tecnologias

| Área | Escolha |
|---|---|
| Framework | **NestJS** (arquitetura modular, DI) |
| Linguagem | **TypeScript** (`strict`) |
| Banco | **PostgreSQL** |
| ORM | **Prisma** (schema em `prisma/schema.prisma`, migrations versionadas) |
| Auth | `@nestjs/passport` + **JWT** (usuário + PIN) |
| Validação | `class-validator` / `class-transformer` (DTOs) |
| Tempo real | **WebSocket** via `@nestjs/websockets` (Gateway) com **Socket.IO** (reconexão/rooms prontos) |
| Testes | Jest + Supertest (e2e) |
| Deploy | Railway / Render / Fly.io (monolito simples) |

## Estrutura por módulos

Um módulo Nest por domínio (nomes em inglês):

```
prisma/
  schema.prisma           # modelo do banco (fonte da verdade)
  migrations/             # migrations versionadas
src/
  prisma/     # PrismaModule + PrismaService (injetável, compartilhado)
  auth/       # AuthModule    — login por usuário + PIN, emissão de JWT
  orders/     # OrdersModule  — CRUD de comandas/itens; closeOrder (marca pago)
  menu/       # MenuModule    — itens e categorias do cardápio
  tables/     # TablesModule  — mesas e status (free/occupied)
  kitchen/    # KitchenModule — tickets e status por item + KitchenGateway (WS)
  common/     # filtros, guards, pipes, utilitários compartilhados
  main.ts
  app.module.ts
```

Cada módulo segue a camada: **controller** (HTTP) → **service** (regra de negócio) → **Prisma** (acesso a dados). O `PrismaService` é um provider injetável exposto por um `PrismaModule` compartilhado (em `src/prisma/`). DTOs validados em toda entrada.

O schema do banco vive em `prisma/schema.prisma` (fonte da verdade do modelo — espelha `../.specs/02-modelo-de-dados.md`). Migrations são geradas com `prisma migrate` e versionadas em `prisma/migrations/`.

## Padrões de desenvolvimento

- **Código em inglês** (endpoints, tabelas, colunas, variáveis). Detalhes em `../.specs/05-padroes-de-codigo.md`.
- **DTOs com `class-validator`** para toda entrada — nunca confiar no corpo cru.
- Erros via exceções do Nest (`NotFoundException`, `UnauthorizedException`, ...).
- **Sem** lógica de pagamento/cobrança/webhook — fora de escopo.
- Toda mudança de comportamento atualiza a spec correspondente em `../.specs/`.

## Setup

Pré-requisitos: Node 20+, Docker (para o PostgreSQL local).

```bash
# banco de dados local (Postgres 16 em Docker)
docker compose up -d

# instalar
npm install

# variáveis de ambiente (criar .env a partir de .env.example)
#   DATABASE_URL=postgresql://app_comanda:app_comanda@localhost:5432/app_comanda?schema=public
#   JWT_SECRET=...

# Prisma: rodar migrations + popular dados de demonstração
npx prisma migrate dev
npx prisma db seed

# rodar em dev (http://localhost:3000/api)
npm run start:dev

# qualidade
npm run typecheck        # tsc --noEmit
npm run lint             # eslint
npm test                 # unidade (services)
npm run test:e2e         # e2e (Supertest + Socket.IO) — usa o banco app_comanda_test
```

> O e2e usa um banco separado (`app_comanda_test`). Crie-o uma vez:
> `docker exec app-comanda-postgres psql -U app_comanda -c 'CREATE DATABASE app_comanda_test'`

Seed de demonstração: operadores `joao`/`maria` (sem PIN — 1º acesso), `demo`
(PIN `1234`), 12 mesas e um cardápio de exemplo. Tickets de cozinha começam
em `#1400`.

### Decisões de implementação

- **Preços em centavos** (`Int`): aritmética exata, sem ponto flutuante.
- **Itens já enviados à cozinha não podem ser editados/removidos** — o
  `PATCH/DELETE` de item retorna 409 se o item já tem ticket.
- **`send-to-kitchen` reenvia apenas itens ainda sem ticket** (novos), nunca
  re-enfileira os já enviados.
- **Fechar conta** grava `closed_at` e `closed_by_id` (auditoria, HU-42) e
  **libera a mesa** quando era a última comanda aberta (HU-41).
- Escritas condicionais (`updateMany` + contagem) protegem contra corridas:
  fechar duas vezes, enviar à cozinha em paralelo, transição dupla de status.
