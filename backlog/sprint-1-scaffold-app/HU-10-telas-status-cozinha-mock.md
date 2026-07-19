# HU-10 · Telas de status de cozinha (mock)

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom (operador)**, quero **acompanhar visualmente o status da cozinha para cada etapa (Enviado, Em preparo, Pronto, Entregue)**, para que **eu saiba quando buscar e servir o pedido do cliente**.

## Critérios de aceite
- [x] Tela 4A (Enviado à cozinha): mostra ticket mockado (ex.: `#1404`) e um stepper com as 4 etapas (Enviado → Preparo → Pronto → Entregue).
- [x] Tela 4B (Em preparo): lista itens "na chapa" com tempo decorrido (mockado, incrementando em tela).
- [x] Tela 4C (Pronto): lista itens prontos e oferece ação **Marcar como entregue**.
- [x] Tela 4D (Entregue): mostra itens servidos; se a comanda ainda está `unpaid`, exibe aviso **"Comanda ainda não paga"**.
- [x] Transição entre as 4 telas/estados reflete mudança de `kitchen_status` mockado (`queued → preparing → ready → delivered`) por item.
- [x] Textos de UI e status via i18n, conforme `.specs/06-glossario.md`.

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (telas 4A-4D), `.specs/02-modelo-de-dados.md` (`order_item.kitchen_status`, `kitchen_ticket`), `.specs/04-fluxos.md` (4.4 Status de cozinha).

## Fora de escopo
- Atualização em tempo real via WebSocket (Sprint 4) — nesta fase as transições são simuladas/manuais em mock.
- Geração real de ticket (`POST /orders/:id/send-to-kitchen`) — fica para HU-29/HU-34.

## Dependências
- HU-09

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
