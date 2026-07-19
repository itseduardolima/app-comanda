# HU-39 · App: ação Fechar conta com confirmação

**Sprint:** 5 — Fechar conta
**Épico:** Fechamento
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **operador (garçom)**, quero **confirmar explicitamente antes de fechar uma conta**, para que **eu não marque uma comanda como paga por engano, já que essa ação é manual e não há reconciliação automática que corrija o erro depois**.

## Critérios de aceite
- [x] Na tela `04 Detalhe da comanda`, o botão/ação "Fechar conta" exibe o **total da comanda** (soma de `quantity * final_price` de todos os `order_item`) antes de confirmar.
- [x] Ao tocar em "Fechar conta", é exibido um passo de confirmação explícito (ex.: modal/dialog) mostrando o total e pedindo confirmação — a ação só é disparada após confirmar.
- [x] Confirmando, o app chama `POST /orders/:id/close` e trata o estado de carregamento (loading) durante a chamada.
- [x] Em caso de sucesso, a UI reflete imediatamente `payment_status: paid` (ex.: badge "Pago") sem exigir refresh manual.
- [x] Em caso de erro (rede, comanda já paga, etc.), a UI exibe mensagem de erro e mantém a comanda como `unpaid`, permitindo nova tentativa.
- [x] Cancelar no passo de confirmação não realiza nenhuma chamada à API.
- [x] Nenhum fluxo de pagamento (cartão/Pix/tap-to-pay) é exibido ou solicitado — a tela deixa claro que o pagamento em si acontece por fora do app.

## Escopo técnico
- Referência: `.specs/04-fluxos.md` (seção 4.3 — Fechamento), `.specs/00-contexto-projeto.md` (riscos: "Fechar conta = registro manual", recomenda confirmação antes de fechar), `.specs/02-modelo-de-dados.md` (cálculo do total do `order`).
- Tela `04 Detalhe da comanda` (`frontend/app/orders/[id]/index.tsx`), ação `closeOrder` (ver glossário em `.specs/06-glossario.md`), textos via i18n.
- Consome o endpoint de HU-38.

## Fora de escopo
- Qualquer coleta de dado de pagamento (cartão, Pix, etc.).
- Mover a comanda para a aba Pagas na lista (tratado em HU-40).
- Liberar a mesa (tratado em HU-41).

## Dependências
- HU-38 (endpoint `closeOrder` no backend).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente/hook do fluxo de confirmação e chamada de fechamento, incluindo caso de erro)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
