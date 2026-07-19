# HU-09 · Tela Detalhe da comanda

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom (operador)**, quero **ver o detalhe de uma comanda com os itens e seus status individuais**, para que **eu acompanhe o pedido completo de uma mesa/cliente e possa adicionar itens ou fechar a conta**.

## Critérios de aceite
- [x] Tela 04 (Detalhe da comanda) lista os itens da comanda mockada com quantidade, modificadores e status individual (`kitchen_status`).
- [x] Exibe o total da comanda (soma de `quantity * final_price` dos itens, sobre dados mockados).
- [x] Ação **Adicionar** retorna ao Cardápio (HU-07) para incluir mais itens na mesma comanda.
- [x] Ação **Fechar conta** está presente e, nesta fase mockada, apenas simula a mudança de `payment_status` para `paid` em memória (sem persistência real) e navega/atualiza a UI de acordo.
- [x] Quando a mesa tem múltiplas comandas (ex.: João e Maria na Mesa 07), a tela deixa claro a qual comanda/pessoa aquele detalhe pertence.
- [x] Textos de UI via i18n; enums traduzidos conforme `.specs/06-glossario.md`.

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (tela 04), `.specs/02-modelo-de-dados.md` (`order`, `order_item`, total da mesa), `.specs/04-fluxos.md` (4.3 Fechamento).

## Fora de escopo
- Efeito real do "Fechar conta" (endpoint `POST /orders/:id/close`) — entra na Sprint 5 (HU-38/HU-39).
- Confirmação/auditoria de fechamento (HU-39, HU-42).

## Dependências
- HU-04, HU-07

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
