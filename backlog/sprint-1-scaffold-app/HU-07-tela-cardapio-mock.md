# HU-07 · Tela Cardápio

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom (operador)**, quero **navegar pelo cardápio por categorias e adicionar itens à comanda**, para que **eu registre o pedido do cliente de forma rápida durante o atendimento**.

## Critérios de aceite
- [x] Tela 02 (Cardápio) exibe categorias e itens mockados (`menu_item`: nome, preço, categoria).
- [x] Tocar em um item permite adicioná-lo diretamente à comanda em edição (quantidade 1 por toque, ou seletor de quantidade).
- [x] Botão/indicador **"Ver comanda"** exibe contador de itens já adicionados na comanda atual.
- [x] Tocar em um item também oferece o caminho para personalizá-lo (navega para HU-08) antes de confirmar a adição.
- [x] "Ver comanda" navega para a tela 04 (Detalhe da comanda — HU-09) com os itens adicionados até o momento.
- [x] Textos de UI (nomes de categoria, botões) via i18n; nomes de itens do cardápio podem vir do mock em português (dado, não string de interface fixa).

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (tela 02), `.specs/02-modelo-de-dados.md` (`menu_item`).

## Fora de escopo
- Consulta real via API (`GET /api/menu`) — fica para HU-26.
- Cálculo de preço final com modificadores (entra junto com a personalização real, HU-08 cobre apenas a interação).

## Dependências
- HU-03

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
