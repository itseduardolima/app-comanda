# HU-04 · Tela Comandas (lista mockada, filtros)

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom (operador)**, quero **ver a lista de comandas com filtros Abertas/Pagas/Todas**, para que **eu saiba rapidamente o que ainda precisa de atenção e o que já foi fechado**.

## Critérios de aceite
- [ ] Tela 01 (Comandas) lista comandas mockadas (dados fixos em memória, sem API).
- [ ] Filtros **Abertas / Pagas / Todas** funcionam sobre os dados mockados (`payment_status: unpaid|paid`).
- [ ] Cada card mostra: mesa/tipo (Mesa/Balcão-Retirada/Delivery), itens, tempo decorrido, status de cozinha e badge **A pagar / Pago**.
- [ ] Tocar em um card navega para a tela 04 (Detalhe da comanda mockada — HU-09).
- [ ] Estado vazio tratado (ex.: filtro "Pagas" sem nenhuma comanda paga ainda).
- [ ] Todos os textos de UI vêm de i18n (nenhuma string hardcoded).

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (tela 01), `.specs/06-glossario.md` (tradução dos enums `order.type` e `order.payment_status`).
- Dados mockados devem seguir o formato do modelo real (`.specs/02-modelo-de-dados.md`) para facilitar a troca por API real na Fase 3 (HU-27).

## Fora de escopo
- Persistência real / API (Sprint 3).
- Ação "Fechar conta" com efeito real (mock apenas, ver HU-09).

## Dependências
- HU-03

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
