# HU-25 · Backend: Orders — itens (adicionar/editar/remover)

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 5

## História de usuário
Como **garçom**, quero **adicionar, editar e remover itens de uma comanda, incluindo personalizações (ponto da carne, ingredientes, observação)**, para que **o pedido anotado reflita exatamente o que o cliente quer**.

## Critérios de aceite
- [x] `POST /api/orders/:id/items` aceita `{ menuItemId, quantity, modifiers? }`; `modifiers` é um JSON livre (ex.: `{ point, remove: [...], note }`) armazenado em `order_item.modifiers`.
- [x] `final_price` do item é calculado e persistido no momento da criação, a partir do `menu_item.price` vigente — nunca recalculado retroativamente se o preço do cardápio mudar depois.
- [x] Item criado começa com `kitchen_status = queued`.
- [x] `PATCH /api/orders/:id/items/:itemId` permite editar `quantity` e/ou `modifiers` do item.
- [x] `DELETE /api/orders/:id/items/:itemId` remove o item da comanda.
- [x] Todas as rotas validam o corpo com DTOs `class-validator` e retornam 404 quando `orderId`/`itemId` não existem.
- [x] Rotas exigem `Authorization: Bearer <jwt>`.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Orders — endpoints de itens, exemplo de `modifiers`), `.specs/02-modelo-de-dados.md` (entidade `order_item`, regra sobre `final_price` não recalculado).

## Fora de escopo
- Envio para a cozinha e mudança de `kitchen_status` além do valor inicial `queued` (coberto na Sprint 4 — HU-29/HU-30).

## Dependências
- HU-20 (Menu, para validar `menuItemId`), HU-24 (detalhe da comanda)

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
