# HU-19 · Backend: setup NestJS + Prisma + Postgres

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 5

## História de usuário
Como **desenvolvedor backend**, quero **um projeto NestJS com Prisma e PostgreSQL configurados, com o schema de dados e a estrutura de módulos por domínio já criados**, para que **os próximos módulos (Menu, Tables, Orders) tenham uma base sólida e consistente para implementar CRUD real**.

## Critérios de aceite
- [ ] Projeto NestJS criado em `backend/` com TypeScript `strict: true`.
- [ ] `prisma/schema.prisma` define as entidades `operator`, `table`, `order`, `order_item`, `menu_item`, `kitchen_ticket` e os enums `order.type` (`dine_in`/`counter`/`delivery`), `order.payment_status` (`unpaid`/`paid`), `table.status` (`free`/`occupied`) e `order_item.kitchen_status` (`queued`/`preparing`/`ready`/`delivered`), espelhando `.specs/02-modelo-de-dados.md`.
- [ ] `PrismaModule` compartilhado em `src/prisma/` expõe `PrismaService` injetável; nenhum outro ponto do código instancia `PrismaClient` diretamente.
- [ ] Primeira migration gerada via `prisma migrate dev` e versionada em `prisma/migrations/`.
- [ ] Estrutura de pastas por domínio criada (`src/auth`, `src/orders`, `src/menu`, `src/tables`, `src/kitchen`, `src/common`), mesmo que ainda vazias/placeholder.
- [ ] `.env.example` documenta `DATABASE_URL` e `JWT_SECRET`.
- [ ] `npm run start:dev` sobe a aplicação localmente conectando ao Postgres sem erros.

## Escopo técnico
- Referências: `.specs/01-arquitetura.md` (componentes do backend), `.specs/02-modelo-de-dados.md` (entidades/enums), `.specs/05-padroes-de-codigo.md` (camadas controller→service→Prisma, `PrismaService` injetado), `backend/README.md` (estrutura de pastas e comandos de setup).

## Fora de escopo
- Implementação de regras de negócio dos módulos (entra nas HUs seguintes desta sprint).
- Autenticação (Sprint 2 já cobre os endpoints; aqui é só a fundação de dados).

## Dependências
- Nenhuma (esta HU é a base do backend).

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
