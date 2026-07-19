# HU-21 · Backend: módulo Tables

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 3

## História de usuário
Como **garçom**, quero **consultar o grid de mesas com seu status (livre/ocupada) e as comandas abertas de uma mesa**, para que **eu saiba quais mesas posso abrir e acompanhe as comandas já em andamento nelas**.

## Critérios de aceite
- [x] `TablesModule` criado com `controller` → `service` → Prisma.
- [x] `GET /api/tables` retorna todas as mesas com `id`, `number` e `status` (`free`/`occupied`).
- [x] `GET /api/tables/:id/orders` retorna as comandas (`order`) abertas (`payment_status = unpaid`, sem `closed_at`) daquela mesa.
- [x] `table.status` reflete corretamente se há pelo menos uma comanda aberta associada (fica `occupied` enquanto houver `order` aberto vinculado; volta a `free` quando não houver nenhuma).
- [x] Ambas as rotas exigem `Authorization: Bearer <jwt>`.
- [x] Erros seguem o padrão NestJS.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Tables — `TablesModule`), `.specs/02-modelo-de-dados.md` (entidade `table`, relação `table` 1—N `order`).

## Fora de escopo
- Endpoint de criação/edição manual de mesas (cadastro de mesas é assumido como seed inicial, não uma tela do MVP).
- Regra de liberação de mesa ao fechar todas as comandas — implementada em detalhe na HU-41 (Sprint 5); aqui apenas a leitura de status precisa estar correta.

## Dependências
- HU-19 (setup NestJS + Prisma)

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
