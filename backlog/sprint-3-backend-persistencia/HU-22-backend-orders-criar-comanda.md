# HU-22 · Backend: Orders — criar comanda

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 3

## História de usuário
Como **garçom**, quero **criar uma nova comanda informando o tipo (Mesa/Balcão-Retirada/Delivery), a mesa (quando aplicável) e um nome opcional**, para que **eu possa começar a anotar o pedido de um cliente**.

## Critérios de aceite
- [ ] `OrdersModule` criado com `controller` → `service` → Prisma.
- [ ] `POST /api/orders` aceita `{ type, tableId?, customerName? }`, valida o corpo com um DTO `class-validator` (nunca confia no corpo cru).
- [ ] `type` aceita somente `dine_in` | `counter` | `delivery`; `tableId` obrigatório quando `type = dine_in`, ausente/ignorado nos demais tipos.
- [ ] Comanda criada com `payment_status = unpaid`, `created_at` preenchido automaticamente, `operator_id` do operador autenticado (via JWT).
- [ ] Uma mesma `table` pode ter múltiplas `order` abertas simultaneamente (não há bloqueio de "mesa já ocupada" impedindo nova comanda).
- [ ] Resposta retorna a comanda criada com `id`.
- [ ] Rota exige `Authorization: Bearer <jwt>`.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Orders, exemplo `POST /api/orders`), `.specs/02-modelo-de-dados.md` (entidade `order`, regra "uma mesa pode ter vários orders abertos").

## Fora de escopo
- Listagem e detalhe de comandas (HU-23, HU-24).
- Qualquer lógica de pagamento.

## Dependências
- HU-19 (setup NestJS + Prisma), HU-21 (Tables, para validar `tableId`)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
