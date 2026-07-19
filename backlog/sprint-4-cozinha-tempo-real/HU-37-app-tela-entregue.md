# HU-37 · App: tela Entregue (aviso "ainda não paga")

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **garçom (operador)**, quero **ver claramente quando uma comanda já foi totalmente entregue mas ainda não foi paga**, para que **eu não esqueça de fechar a conta antes do cliente ir embora**.

## Critérios de aceite
- [x] Tela 4D lista os `order_item` com `kitchen_status = delivered`.
- [x] Se `order.payment_status === "unpaid"`, a tela exibe um aviso destacado "Comanda ainda não paga".
- [x] Se `order.payment_status === "paid"`, o aviso não é exibido.
- [x] O aviso desaparece em tempo real assim que a comanda é fechada em outra tela (evento `order.updated` recebido via WebSocket), sem precisar recarregar.
- [x] Todos os textos vêm de i18n (pt-BR).

## Escopo técnico
- Tela `4D Entregue` conforme `.specs/00-contexto-projeto.md` e `.specs/04-fluxos.md` (4.4, último item).
- Consome `order.payment_status` e o evento `order.updated` (`.specs/03-api-contrato.md`).

## Fora de escopo
- A ação de fechar a conta em si (botão "Fechar conta") — pertence à tela 04 Detalhe da comanda, coberta no Sprint 5 (HU-39).

## Dependências
- HU-32 (App: cliente WebSocket), HU-36 (App: tela Pronto + marcar como entregue).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (exibição condicional do aviso)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
