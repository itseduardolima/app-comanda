# HU-24 · Backend: Orders — detalhe da comanda

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 2

## História de usuário
Como **garçom**, quero **ver o detalhe completo de uma comanda, incluindo todos os seus itens e o status individual de cada um**, para que **eu saiba exatamente o que foi pedido e em que etapa da cozinha cada item está**.

## Critérios de aceite
- [x] `GET /api/orders/:id` implementado, retornando a comanda com seus `order_item` (incluindo `menu_item_id`, `quantity`, `final_price`, `modifiers`, `kitchen_status` de cada item).
- [x] Retorna 404 (`NotFoundException`) quando o `id` não existe.
- [x] Total da comanda calculável a partir dos itens retornados (`quantity * final_price` de cada `order_item`), conforme regra de `02-modelo-de-dados.md`.
- [x] Rota exige `Authorization: Bearer <jwt>`.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Orders — `GET /api/orders/:id`), `.specs/02-modelo-de-dados.md` (relação `order` 1—N `order_item`, regra "Total da mesa").

## Fora de escopo
- Cálculo de total agregado por mesa (regra de agregação ainda em aberto, ver `.specs/00-contexto-projeto.md` riscos) — aqui só o total por comanda individual é necessário.

## Dependências
- HU-22 (criar comanda)

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
