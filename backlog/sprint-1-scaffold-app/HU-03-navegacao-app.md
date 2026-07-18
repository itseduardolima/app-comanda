# HU-03 · Navegação (stack auth + tabs + rotas de detalhe)

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom (operador)**, quero **navegar entre as telas do app (login, comandas, cardápio, detalhes) de forma fluida**, para que **eu consiga me mover pelo fluxo de trabalho sem travas ou telas em branco**.

## Critérios de aceite
- [ ] Navegação implementada com Expo Router (file-based), com pastas de rota espelhando as telas do `.specs/00-contexto-projeto.md`.
- [ ] Stack de autenticação isolado: `login`, `pin-create`, `pin-verify` (telas 00, 00A, 00B), sem tab bar visível.
- [ ] Tab bar principal com 4 abas: **Comandas · Cardápio · Vendas · Perfil**, visível apenas após autenticação (mock de sessão nesta fase).
- [ ] Rotas de detalhe acessíveis a partir das abas: Nova comanda (1A), Escolher mesa (1B), Personalizar item (03), Detalhe da comanda (04), telas de cozinha (4A-4D).
- [ ] Navegação entre todas as telas do MVP funciona sem crash, com botão de voltar coerente (Android hardware back incluso).
- [ ] Transições e parâmetros de rota (ex.: `orderId`, `tableId`) tipados em TypeScript.

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (tabela de telas do MVP), `frontend/README.md` (estrutura sugerida de `app/`).
- Nenhuma tela tem lógica de dados reais ainda — apenas roteamento entre telas (o conteúdo mockado vem nas HUs seguintes).

## Fora de escopo
- Conteúdo/dados das telas (HU-04 a HU-10).
- Autenticação real (Sprint 2) — aqui a entrada no app pode ser um mock/bypass.

## Dependências
- HU-01, HU-02

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
