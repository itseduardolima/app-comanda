# HU-38 · Backend: endpoint closeOrder

**Sprint:** 5 — Fechar conta
**Épico:** Fechamento
**Camada:** Backend
**Story points:** 2

## História de usuário
Como **operador (garçom)**, quero **marcar uma comanda como paga através da API**, para que **o app possa registrar o fechamento da conta sem processar nenhum pagamento de fato**.

## Critérios de aceite
- [x] `POST /api/orders/:id/close` muda `payment_status` de `unpaid` para `paid`.
- [x] O endpoint preenche `closed_at` com o timestamp do fechamento (ISO 8601 UTC).
- [x] O endpoint registra/confirma o `operator_id` do operador autenticado (via JWT) como quem fechou a comanda.
- [x] Chamar `close` em uma comanda já `paid` retorna erro (ex.: `400/409`), não reprocessa o fechamento.
- [x] Chamar `close` em uma comanda inexistente retorna `404 NotFoundException`.
- [x] A resposta retorna a comanda atualizada (com `paymentStatus: "paid"` e `closedAt`).
- [x] Nenhum campo de cobrança, id de transação, aprovação ou webhook é criado ou chamado — `payment_status` é a única mudança de estado.

## Escopo técnico
- Referência: `.specs/03-api-contrato.md` (`POST /api/orders/:id/close`), `.specs/02-modelo-de-dados.md` (seção "Sobre pagamento": `unpaid → paid` + `closed_at`), `.specs/01-arquitetura.md` (`OrdersModule` → `closeOrder`).
- Implementar em `OrdersModule` (`backend/src/orders/`): `OrdersController` expõe a rota, `OrdersService.closeOrder(id, operatorId)` aplica a regra via `PrismaService`.
- Se o evento `order.updated` (WebSocket) já estiver disponível (Sprint 4), disparar após o fechamento para notificar o app em tempo real.

## Fora de escopo
- Qualquer processamento de pagamento (cartão, Pix, tap-to-pay, adquirente).
- Webhook, id de cobrança externa, estado de aprovação.
- Liberação de mesa (tratada em HU-41) e confirmação de UI (tratada em HU-39).

## Dependências
- Sprint 3 — HU-22 (criar comanda) e HU-24 (detalhe da comanda) precisam existir para haver uma comanda a fechar.

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando (unidade do `OrdersService.closeOrder` + e2e do endpoint, incluindo caso de comanda já paga e comanda inexistente)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
