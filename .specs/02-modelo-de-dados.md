# 02 · Modelo de dados

> Nomes de tabelas e colunas em **inglês**. A UI traduz para português (ver `06-glossario.md`).
> **Não existe tabela de pagamento** — "pago" é o campo `payment_status` do `order`.
> **Implementação:** este modelo é materializado no backend via **Prisma** (`backend/prisma/schema.prisma`), que é a fonte da verdade executável. O rascunho abaixo é a referência conceitual; os enums viram `enum` do Prisma.

## Entidades

```
operator(id, username, pin_hash, name, created_at, pin_set)
table(id, number, status[free|occupied])
order(id, type[dine_in|counter|delivery], table_id?, customer_name,
      payment_status[unpaid|paid], created_at, closed_at?, operator_id,
      closed_by_id?)
   -- uma table pode ter vários orders abertos ao mesmo tempo
   -- operator_id = quem abriu; closed_by_id = quem fechou (auditoria HU-42)
order_item(id, order_id, menu_item_id, quantity, final_price,
           modifiers[json], kitchen_status[queued|preparing|ready|delivered],
           kitchen_status_changed_at?, kitchen_ticket_id?)
   -- kitchen_ticket_id nulo = item ainda não enviado à cozinha (HU-29:
   --   send-to-kitchen só enfileira itens sem ticket)
   -- kitchen_status_changed_at alimenta o "tempo decorrido" da tela 4B
menu_item(id, name, price, category, customization[json]?)
   -- customization: { removableIngredients?, extraIngredients?[{name,price}],
   --   meatPoint? } — dados da tela 03 Personalizar item
kitchen_ticket(id, order_id, number, created_at)  -- number sequencial, ex.: #1404
```

> **Preços em centavos**: `menu_item.price` e `order_item.final_price` são
> inteiros (centavos de BRL). Evita erro de ponto flutuante; a UI formata.

## Enums

| Enum | Valores | UI (pt) |
|---|---|---|
| `order.type` | `dine_in` \| `counter` \| `delivery` | Mesa \| Balcão-Retirada \| Delivery |
| `order.payment_status` | `unpaid` \| `paid` | A pagar \| Pago |
| `table.status` | `free` \| `occupied` | Livre \| Ocupada |
| `order_item.kitchen_status` | `queued` \| `preparing` \| `ready` \| `delivered` | Na fila \| Preparando \| Pronto \| Entregue |

## Relacionamentos e regras

- **`table` 1—N `order`**: uma mesa pode ter várias comandas abertas simultaneamente (conta dividida por pessoa).
- **`order` 1—N `order_item`**: cada item tem seu **próprio** `kitchen_status`, independente do status geral da comanda.
- **`order` 1—N `kitchen_ticket`**: cada envio à cozinha gera um ticket numerado.
- **`order_item.menu_item_id` → `menu_item`**: item do cardápio de origem. `final_price` guarda o preço com modificadores aplicados no momento do pedido (não recalcular a partir do `menu_item` atual).
- **`order_item.modifiers` (json)**: retirar/adicionar ingredientes, ponto da carne, observação.

## Sobre pagamento

- `payment_status` começa em `unpaid`.
- "Fechar conta" (`closeOrder`) faz `unpaid → paid` e preenche `closed_at`.
- **Sem** estado de aprovação, id de cobrança externa ou webhook. É uma mudança de flag definida manualmente pelo operador.
- Recomendação de auditoria (ver riscos): registrar `operator_id` de quem fechou (já presente no `order`) e confirmar antes de fechar.

## Status da mesa (regra de agregação — decidida na HU-41)

Uma `table` fica `occupied` enquanto tiver **pelo menos uma** `order` com
`payment_status = unpaid`; volta a `free` quando **todas** as suas comandas
estiverem pagas (ou não houver nenhuma aberta). A regra vive **no backend**
(`TablesService.refreshStatus`, chamada ao criar e ao fechar comanda) — o
cliente nunca a reimplementa.

## Total da mesa

Total de um `order` = soma de `quantity * final_price` dos seus `order_item`
(`final_price` é o preço **unitário** congelado no momento do pedido).
Total agregado de uma mesa (exibição) segue em aberto — hoje cada comanda
mostra apenas o próprio total.
