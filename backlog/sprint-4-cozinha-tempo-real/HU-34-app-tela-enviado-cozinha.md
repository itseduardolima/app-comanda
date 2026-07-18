# HU-34 · App: tela Enviado à cozinha (ticket + stepper)

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom (operador)**, quero **ver o ticket gerado e o progresso da comanda em um stepper assim que envio para a cozinha**, para que **eu saiba que o pedido foi recebido e acompanhe visualmente em que etapa ele está**.

## Critérios de aceite
- [ ] Ao enviar a comanda para a cozinha (ação que chama `POST /orders/:id/send-to-kitchen`), a tela 4A exibe o número do ticket retornado (ex.: `#1404`).
- [ ] Um stepper visual mostra as 4 etapas **Enviado → Preparo → Pronto → Entregue**, com a etapa atual destacada.
- [ ] O stepper avança automaticamente em tempo real quando chega o evento `item.status.changed`/`order.updated` via WebSocket (HU-32), sem precisar sair e voltar da tela.
- [ ] Tela usa dados reais da API (substitui o mock da HU-10 do Sprint 1) e persiste corretamente ao reabrir o app (via baseline REST, HU-33).
- [ ] Todos os textos da tela vêm de i18n (pt-BR), sem strings hardcoded.

## Escopo técnico
- Tela `4A Enviado à cozinha` conforme `.specs/00-contexto-projeto.md` e `.specs/04-fluxos.md` (4.4).
- Rota sugerida em `frontend/README.md`: `app/orders/[id]/kitchen.tsx`.
- Consome a store atualizada pelo cliente WebSocket (HU-32) e pelo resync REST (HU-33).

## Fora de escopo
- Telas 4B/4C/4D (Em preparo, Pronto, Entregue) — cobertas pelas HU-35, HU-36, HU-37.

## Dependências
- HU-32 (App: cliente WebSocket), HU-33 (App: reconexão e ressincronização).
- HU-10 (Telas de status de cozinha — mock), do Sprint 1 — esta HU substitui os dados mockados por reais.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente renderiza estados do stepper corretamente)
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
