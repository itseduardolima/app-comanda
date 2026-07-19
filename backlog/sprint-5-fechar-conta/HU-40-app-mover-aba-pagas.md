# HU-40 · App: mover comanda para aba Pagas

**Sprint:** 5 — Fechar conta
**Épico:** Fechamento
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **operador (garçom)**, quero **que uma comanda fechada saia da lista de Abertas e apareça em Pagas automaticamente**, para que **eu enxergue rapidamente quais mesas/comandas ainda precisam de atenção e quais já foram concluídas**.

## Critérios de aceite
- [x] Na tela `01 Comandas`, o filtro **Abertas** não exibe comandas com `payment_status: paid`.
- [x] O filtro **Pagas** exibe apenas comandas com `payment_status: paid`.
- [x] O filtro **Todas** continua exibindo ambas, com o badge de status correto (A pagar/Pago) em cada card.
- [x] Após um "Fechar conta" bem-sucedido (HU-39), a lista reflete a mudança sem exigir pull-to-refresh manual: por atualização otimista do estado local e/ou pelo evento `order.updated` recebido via WebSocket (se o Sprint 4 já estiver integrado).
- [x] Se o operador estiver na aba Abertas no momento do fechamento, a comanda some da lista visível imediatamente após a confirmação.
- [x] Reabrir o app (cold start) e consultar `GET /api/orders?status=open|paid|all` reflete o estado correto vindo do backend (garante que não é só estado otimista local).

## Escopo técnico
- Referência: `.specs/04-fluxos.md` (seção 4.3), `.specs/03-api-contrato.md` (`GET /api/orders?status=open|paid|all`), `.specs/06-glossario.md` (filtros `open`/`paid`/`all` → Abertas/Pagas/Todas).
- Tela `01 Comandas` (`frontend/app/(tabs)/orders/`), store Zustand de comandas atualizada após o fechamento.

## Fora de escopo
- A ação de fechar em si (tratada em HU-39).
- Liberação de mesa (tratada em HU-41).

## Dependências
- HU-39 (ação de fechar conta que dispara a mudança de status).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (filtragem por status e atualização de estado após fechamento)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
