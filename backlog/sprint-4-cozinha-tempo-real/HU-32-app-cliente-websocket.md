# HU-32 · App: cliente WebSocket (subscribe/deltas)

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom (operador)**, quero **que o app se conecte automaticamente ao canal de tempo real da comanda aberta**, para que **as telas de cozinha atualizem sozinhas conforme o status muda, sem eu precisar puxar para atualizar**.

## Critérios de aceite
- [ ] App conecta ao WebSocket do backend usando `socket.io-client`, enviando o JWT da sessão no handshake.
- [ ] Ao abrir a tela de uma comanda ou mesa, o app emite `subscribe` com `{ orderId }` e/ou `{ tableId }` correspondente.
- [ ] Ao sair da tela (unmount), o app emite `unsubscribe` para a mesma room, evitando updates desnecessários.
- [ ] Eventos recebidos (`item.status.changed`, `order.updated`, `kitchen.ticket.created`) atualizam diretamente as stores Zustand relevantes, sem nova chamada REST.
- [ ] A UI reflete a mudança de status em até 1s após o evento chegar (verificável manualmente/e2e).
- [ ] Conexão é reaproveitada entre telas (um único socket por sessão do app, não uma conexão por tela).

## Escopo técnico
- Cliente descrito em `.specs/01-arquitetura.md` e `.specs/03-api-contrato.md` (seção "Tempo real — WebSocket (Gateway)"); estrutura de pastas sugerida em `frontend/README.md` (`src/ws/`).
- Eventos e payloads exatamente como especificados no contrato (`item.status.changed`, `order.updated`, `kitchen.ticket.created`; cliente→servidor `subscribe`/`unsubscribe`).
- Stores atualizadas: as mesmas stores Zustand que hoje recebem dados mockados (Sprint 1) ou via REST (Sprint 3).

## Fora de escopo
- Lógica de reconexão e ressincronização via REST após queda de rede — coberta pela HU-33.
- Telas que consomem esses dados — cobertas pelas HU-34 a HU-37.

## Dependências
- HU-31 (Backend: KitchenGateway) — o servidor precisa expor o canal antes do cliente se conectar.
- HU-18 (App: persistência de sessão JWT), do Sprint 2 — o token usado no handshake vem dessa sessão.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (mock do socket em testes de hook/store)
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
