# HU-41 · Regra de negócio: liberar mesa quando todas comandas fecham

**Sprint:** 5 — Fechar conta
**Épico:** Fechamento
**Camada:** Fullstack
**Story points:** 3

## História de usuário
Como **operador (garçom)**, quero **que uma mesa só volte a ficar Livre quando todas as comandas abertas nela estiverem pagas**, para que **eu não sente um novo cliente numa mesa que ainda tem uma conta pendente de outra pessoa**.

## Critérios de aceite
- [x] Definida e documentada a regra de agregação: uma `table` é `occupied` se tiver **pelo menos uma** `order` com `payment_status: unpaid`; só passa a `free` quando **todas** as `order` associadas a ela estiverem `paid` (ou não houver nenhuma `order` aberta).
- [x] Ao fechar uma comanda (`closeOrder`, HU-38) que **não é a última** comanda aberta da mesa, o `table.status` permanece `occupied`.
- [x] Ao fechar a **última** comanda aberta de uma mesa, o `table.status` muda automaticamente para `free`.
- [x] O grid de mesas (`GET /api/tables`, tela `1B Escolher mesa`) reflete o status correto após cada fechamento, sem exigir intervenção manual do operador.
- [x] Caso especial coberto por teste: Mesa 07 com duas comandas (João `unpaid`, Maria `unpaid`) — fechar a de João mantém a mesa `occupied`; fechar em seguida a de Maria libera a mesa.
- [x] A regra fica centralizada no backend (fonte da verdade), não duplicada/reimplementada no cliente.

## Escopo técnico
- Referência: `.specs/02-modelo-de-dados.md` (relacionamento `table` 1—N `order`, ponto em aberto "Total da mesa"/regra de agregação), `.specs/00-contexto-projeto.md` (risco "Múltiplas comandas por mesa: definir regras... o que acontece ao fechar uma comanda e deixar outra aberta").
- Implementar como parte do `OrdersService.closeOrder` (recalcular `table.status` após o fechamento) ou via hook no `TablesModule`; expor no `GET /api/tables` e, se disponível, notificar via WebSocket (`order.updated`/evento de mesa).
- Atualizar `.specs/02-modelo-de-dados.md` com a regra de agregação decidida (ela hoje está listada como ponto em aberto).

## Fora de escopo
- Dividir itens entre comandas da mesma mesa (regra de split, ainda não decidida — permanece como ponto em aberto).
- Cálculo do "total da mesa" para exibição (fora do escopo desta HU, que trata apenas do status `free`/`occupied`).

## Dependências
- HU-38 (endpoint `closeOrder`).
- Sprint 3 — HU-21 (`TablesModule` já implementado).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando (cenário de múltiplas comandas por mesa, incluindo o caso "fecha uma, mesa continua ocupada")
- [x] Spec em `.specs/` atualizada (regra de agregação deixa de ser "ponto em aberto" em `02-modelo-de-dados.md`)
- [x] Nenhuma lógica de pagamento/cobrança introduzida
