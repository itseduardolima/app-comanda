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

## Setup (a preencher no scaffold — Fase 3)

```bash
# instalar
npm install

# variáveis de ambiente (criar .env a partir de .env.example)
#   DATABASE_URL=postgres://...
#   JWT_SECRET=...

# Prisma: gerar client + rodar migrations
npx prisma generate
npx prisma migrate dev

# rodar em dev
npm run start:dev

# testes
npm test
npm run test:e2e
```

> Ainda **não há código** — este diretório contém apenas a documentação. O scaffold entra na **Fase 3** do roadmap (ver `../PLANEJAMENTO.md`).
