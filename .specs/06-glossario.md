# 06 · Glossário — código (inglês) ↔ UI (português)

Regra: **código em inglês, tela em português.** Este mapa é a referência única de tradução.

## Entidades

| Código | UI (pt) |
|---|---|
| `order` | Comanda |
| `order_item` | Item da comanda |
| `table` | Mesa |
| `menu_item` | Item do cardápio |
| `operator` | Operador / Garçom |
| `kitchen_ticket` | Ticket de cozinha |

## Tipos de comanda — `order.type`

| Código | UI (pt) |
|---|---|
| `dine_in` | Mesa |
| `counter` | Balcão-Retirada |
| `delivery` | Delivery |

## Status de pagamento — `order.payment_status`

| Código | UI (pt) |
|---|---|
| `unpaid` | A pagar |
| `paid` | Pago |

## Status da mesa — `table.status`

| Código | UI (pt) |
|---|---|
| `free` | Livre |
| `occupied` | Ocupada |

## Status de cozinha (por item) — `order_item.kitchen_status`

| Código | UI (pt) |
|---|---|
| `queued` | Na fila |
| `preparing` | Preparando / Em preparo |
| `ready` | Pronto |
| `delivered` | Entregue |

## Ações

| Código | UI (pt) |
|---|---|
| `closeOrder` | Fechar conta |
| `sendToKitchen` | Enviar para cozinha |
| `markDelivered` | Marcar como entregue |

## Abas / navegação

| Código | UI (pt) |
|---|---|
| Orders tab | Comandas |
| Menu tab | Cardápio |
| Sales tab | Vendas |
| Profile tab | Perfil |
| filter `open` / `paid` / `all` | Abertas / Pagas / Todas |
