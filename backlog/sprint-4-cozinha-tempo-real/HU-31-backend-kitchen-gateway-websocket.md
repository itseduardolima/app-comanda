# HU-31 · Backend: KitchenGateway (WebSocket)

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Backend
**Story points:** 5

## História de usuário
Como **garçom (operador)**, quero **receber atualizações de status de cozinha em tempo real, sem precisar recarregar a tela**, para que **eu acompanhe o pedido instantaneamente enquanto atendo outras mesas**.

## Critérios de aceite
- [x] `KitchenGateway` implementado com `@nestjs/websockets` (`@WebSocketGateway()`), usando **Socket.IO** como adapter.
- [x] Handshake de conexão exige o mesmo **JWT** usado no REST; conexão sem token válido é recusada.
- [x] Cliente pode emitir `subscribe` com `{ orderId? , tableId? }` e entra nas rooms `order:<id>` e/ou `table:<id>`; `unsubscribe` remove das rooms.
- [x] Ao `PATCH /kitchen/items/:itemId` mudar o status, o Gateway difunde `item.status.changed` com `{ orderId, itemId, kitchenStatus }` para a room `order:<id>`.
- [x] Ao item ser adicionado/removido ou a comanda ser fechada, o Gateway difunde `order.updated` com `{ orderId, paymentStatus, ... }`.
- [x] Ao `send-to-kitchen` gerar um ticket, o Gateway difunde `kitchen.ticket.created` com `{ orderId, ticketNumber }`.
- [x] O Gateway **não** processa escritas — todas as mutações continuam passando pelos endpoints REST; o Gateway apenas assina eventos internos do service e retransmite para as rooms inscritas.

## Escopo técnico
- Ver `.specs/01-arquitetura.md` (seção "Comunicação de status de cozinha") e `.specs/03-api-contrato.md` (seção "Tempo real — WebSocket (Gateway)") para a lista completa de eventos e a convenção de rooms.
- Cliente: `socket.io-client` (consumido na HU-32).
- Sem Redis/message broker no MVP — o Gateway roda no mesmo processo do monolito Nest.

## Fora de escopo
- Lógica de reconexão do lado do cliente — coberta pela HU-33 (é responsabilidade do app).
- Qualquer persistência adicional: o Gateway só difunde estado já persistido pelo REST.

## Dependências
- HU-29 (enviar comanda para cozinha) e HU-30 (atualizar status por item) — são as mutações que o Gateway observa para gerar os eventos.

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (teste de integração do Gateway com cliente Socket.IO de teste)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
