# HU-36 · App: tela Pronto + marcar como entregue

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom (operador)**, quero **ver quais itens estão prontos e marcá-los como entregues ao cliente**, para que **a cozinha e a comanda reflitam corretamente que o prato já foi servido**.

## Critérios de aceite
- [ ] Tela 4C lista os `order_item` com `kitchen_status = ready`.
- [ ] Cada item tem uma ação **Marcar como entregue** (`markDelivered`) que chama `PATCH /api/kitchen/items/:itemId` com `{ "kitchenStatus": "delivered" }`.
- [ ] Ao confirmar a entrega, o item some da lista de "Pronto" (via atualização otimista e/ou evento `item.status.changed` recebido de volta).
- [ ] A lista atualiza em tempo real via WebSocket quando um novo item passa a `ready`.
- [ ] Falha de rede ao marcar como entregue exibe erro e não altera o estado local até confirmação do backend (nada de UI otimista sem rollback).
- [ ] Todos os textos vêm de i18n (pt-BR).

## Escopo técnico
- Tela `4C Pronto` conforme `.specs/00-contexto-projeto.md`; ação `markDelivered` conforme glossário (`.specs/06-glossario.md`).
- Endpoint consumido: `PATCH /api/kitchen/items/:itemId` (HU-30).

## Fora de escopo
- Qualquer notificação push/som para o garçom quando um item fica pronto — não especificado no MVP.

## Dependências
- HU-30 (Backend: atualizar status por item), HU-32 (App: cliente WebSocket), HU-35 (App: tela Em preparo).

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (ação de marcar como entregue, inclusive caso de falha de rede)
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
