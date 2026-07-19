# HU-29 · Backend: enviar comanda para cozinha

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Backend
**Story points:** 3

## História de usuário
Como **garçom (operador)**, quero **enviar os itens da comanda para a cozinha**, para que **a equipe da cozinha saiba o que precisa preparar, com um ticket numerado para acompanhamento**.

## Critérios de aceite
- [x] `POST /api/orders/:id/send-to-kitchen` cria um `kitchen_ticket` novo associado ao `order`, com número sequencial (ex.: `#1404`).
- [x] Todos os `order_item` do pedido ainda não enviados têm seu `kitchen_status` definido como `queued`.
- [x] O endpoint retorna o ticket criado (`id`, `number`, `orderId`, `createdAt`) e a lista de itens enfileirados.
- [x] Chamar o endpoint numa comanda sem itens retorna erro de validação (não cria ticket vazio).
- [x] Itens já enviados anteriormente (status diferente de recém-adicionado) não são reenfileirados na mesma chamada — apenas os novos itens pendentes de envio.
- [x] Endpoint protegido por JWT (`Authorization: Bearer`), como os demais endpoints de `OrdersModule`.

## Escopo técnico
- Módulo `KitchenModule`, rota descrita em `.specs/03-api-contrato.md` (seção Kitchen — `KitchenModule`).
- Entidade `kitchen_ticket(id, order_id, number, created_at)` conforme `.specs/02-modelo-de-dados.md`.
- Persistência via Prisma (`PrismaService` injetado), seguindo `.specs/05-padroes-de-codigo.md` (camada controller → service → Prisma, DTOs validados com `class-validator`).
- Esta ação é o gatilho que a HU-31 (KitchenGateway) usa para difundir o evento `kitchen.ticket.created`.

## Fora de escopo
- Difusão em tempo real do ticket criado (WebSocket) — coberta pela HU-31.
- Qualquer geração de comprovante/nota fiscal.

## Dependências
- HU-25 (Backend: Orders — itens da comanda), do Sprint 3 — precisa existir itens na comanda antes de enviá-los à cozinha.

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando (unidade do service + e2e do controller)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
