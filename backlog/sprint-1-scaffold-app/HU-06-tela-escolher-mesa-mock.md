# HU-06 · Tela Escolher mesa

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **garçom (operador)**, quero **ver um grid de mesas com status Livre/Ocupada e escolher uma mesa livre**, para que **eu abra uma nova comanda no lugar certo do salão**.

## Critérios de aceite
- [ ] Tela 1B (Escolher mesa) exibe grid de mesas mockadas com `table.status` (`free`/`occupied`).
- [ ] Mesas **Livres** são selecionáveis; mesas **Ocupadas** são visualmente distintas (ex.: desabilitadas ou com indicação de que já têm comanda(s) aberta(s)).
- [ ] Mesa ocupada pode ser tocada para ver as comandas já abertas nela (ex.: navega para lista de comandas daquela mesa), suportando o caso de **múltiplas comandas por mesa**.
- [ ] Escolher uma mesa livre abre a comanda mockada (com o tipo `dine_in` e a mesa associada) e navega ao Cardápio (HU-07).
- [ ] Textos de UI via i18n; `free`/`occupied` traduzidos conforme `.specs/06-glossario.md`.

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (tela 1B), `.specs/02-modelo-de-dados.md` (`table.status`, relação `table` 1—N `order`).

## Fora de escopo
- Consulta real via API (`GET /api/tables`) — fica para HU-27.
- Regras de divisão de total entre comandas da mesma mesa (ponto em aberto do produto).

## Dependências
- HU-05

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
