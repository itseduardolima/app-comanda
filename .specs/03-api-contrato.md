# 03 · Contrato da API (REST)

> Rascunho do contrato entre app e backend. Todos os endpoints (exceto auth) exigem `Authorization: Bearer <jwt>`.
> Corpos e respostas em JSON. Campos em **inglês**.

## Convenções

- Base URL: `/api` (versionar como `/api/v1` quando estabilizar).
- IDs são strings (UUID sugerido).
- Datas em ISO 8601 UTC.
- Erros seguem o padrão do NestJS: `{ statusCode, message, error }`.
- Validação de entrada com `class-validator` (DTOs).

## Auth — `AuthModule`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Passo 1: valida `username`, informa se PIN já existe (`pin_set`) |
| `POST` | `/api/auth/pin/create` | 1º acesso: define PIN (4 dígitos) e retorna JWT |
| `POST` | `/api/auth/pin/verify` | Acessos seguintes: valida PIN e retorna JWT |

```jsonc
// POST /api/auth/login
{ "username": "joao" }
// → { "operatorId": "...", "pinSet": true }

// POST /api/auth/pin/verify
{ "operatorId": "...", "pin": "1234" }
// → { "accessToken": "eyJ...", "operator": { "id": "...", "name": "João" } }
```

> Política de segurança do PIN (bloqueio após N tentativas) — ver riscos em `00-contexto-projeto.md`.

## Orders — `OrdersModule`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/orders?status=open\|paid\|all` | Lista comandas (filtros Abertas/Pagas/Todas) |
| `POST` | `/api/orders` | Cria comanda (`type`, `tableId?`, `customerName?`) |
| `GET` | `/api/orders/:id` | Detalhe da comanda com itens |
| `POST` | `/api/orders/:id/items` | Adiciona item (`menuItemId`, `quantity`, `modifiers`) |
| `PATCH` | `/api/orders/:id/items/:itemId` | Edita item (quantidade/modificadores) |
| `DELETE` | `/api/orders/:id/items/:itemId` | Remove item |
| `POST` | `/api/orders/:id/close` | **Fechar conta** → `payment_status = paid` |

```jsonc
// POST /api/orders
{ "type": "dine_in", "tableId": "t-07", "customerName": "João" }

// POST /api/orders/:id/items
{ "menuItemId": "m-picanha", "quantity": 1,
  "modifiers": { "point": "ao_ponto", "remove": ["cebola"], "note": "sem sal" } }
```

## Menu — `MenuModule`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/menu` | Cardápio completo (categorias + itens) |
| `GET` | `/api/menu/categories` | Lista de categorias |

## Tables — `TablesModule`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tables` | Grid de mesas com `status` (free/occupied) |
| `GET` | `/api/tables/:id/orders` | Comandas abertas de uma mesa |

## Kitchen — `KitchenModule`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/orders/:id/send-to-kitchen` | Gera `kitchen_ticket`, enfileira itens (`queued`) |
| `PATCH` | `/api/kitchen/items/:itemId` | Atualiza `kitchen_status` do item |
| `GET` | `/api/kitchen/tickets?orderId=` | Consulta tickets/status (baseline / ressync) |

```jsonc
// PATCH /api/kitchen/items/:itemId
{ "kitchenStatus": "ready" }   // queued → preparing → ready → delivered
```

## Tempo real — WebSocket (Gateway)

Canal WS servido pelo backend (`@nestjs/websockets`). Autenticação com o **mesmo JWT** no handshake. O REST continua sendo a fonte para CRUD e baseline; o WS empurra os **deltas**.

**Namespace/rooms (sugestão):** cliente entra na room da comanda (`order:<id>`) e/ou da mesa (`table:<id>`).

**Eventos servidor → cliente:**

| Evento | Payload | Quando |
|---|---|---|
| `item.status.changed` | `{ orderId, itemId, kitchenStatus }` | `PATCH /kitchen/items/:itemId` muda status |
| `order.updated` | `{ orderId, paymentStatus, ... }` | Item adicionado/removido, comanda fechada |
| `kitchen.ticket.created` | `{ orderId, ticketNumber }` | `send-to-kitchen` gera ticket |

**Eventos cliente → servidor:**

| Evento | Payload | Efeito |
|---|---|---|
| `subscribe` | `{ orderId? , tableId? }` | Entra nas rooms para receber deltas |
| `unsubscribe` | `{ orderId?, tableId? }` | Sai das rooms |

> Regra: mutações continuam via **REST** (para validação/DTO/persistência). O Gateway **não** é usado para escrever — ele só difunde o resultado das mutações a quem está inscrito.

> **Sem** endpoints de pagamento/cobrança/webhook — fora de escopo.
