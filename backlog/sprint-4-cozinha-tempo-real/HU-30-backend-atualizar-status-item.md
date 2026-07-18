# HU-30 · Backend: atualizar status por item

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Backend
**Story points:** 2

## História de usuário
Como **cozinha (ou sistema de cozinha/KDS)**, quero **atualizar o status de preparo de cada item individualmente**, para que **o garçom e o cliente acompanhem o progresso exato do pedido, item a item**.

## Critérios de aceite
- [ ] `PATCH /api/kitchen/items/:itemId` aceita `{ "kitchenStatus": "queued" | "preparing" | "ready" | "delivered" }` e atualiza o `order_item` correspondente.
- [ ] Transições seguem a ordem `queued → preparing → ready → delivered`; uma transição para um status fora dessa sequência (ex.: `queued` direto para `delivered`) é rejeitada com erro de validação.
- [ ] `GET /api/kitchen/tickets?orderId=` retorna os tickets e o status atual de cada item da comanda — usado como baseline/ressync pelo app (HU-33).
- [ ] Atualizar um item inexistente retorna `404 NotFoundException`.
- [ ] Cada atualização de status dispara o evento `item.status.changed` (consumido pela HU-31), mas o teste desta HU cobre apenas a persistência e a resposta REST.
- [ ] Endpoint protegido por JWT.

## Escopo técnico
- Rotas descritas em `.specs/03-api-contrato.md` (`KitchenModule`): `PATCH /api/kitchen/items/:itemId`, `GET /api/kitchen/tickets?orderId=`.
- Enum `order_item.kitchen_status` conforme `.specs/02-modelo-de-dados.md` e `.specs/06-glossario.md` (Na fila / Preparando / Pronto / Entregue).
- Validação de transição de estado implementada no `service` do `KitchenModule` (não no controller).

## Fora de escopo
- Emissão do evento WebSocket em si — coberta pela HU-31.
- Regra de tempo decorrido/exibição — é responsabilidade do app (HU-35).

## Dependências
- HU-29 (Backend: enviar comanda para cozinha) — os itens precisam estar `queued` antes de terem status atualizado.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (casos de transição válida e inválida)
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
