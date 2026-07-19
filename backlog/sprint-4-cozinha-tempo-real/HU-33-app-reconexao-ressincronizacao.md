# HU-33 · App: reconexão e ressincronização via REST

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom (operador) em um salão com rede instável**, quero **que o app se recupere sozinho quando a conexão cair e voltar**, para que **eu nunca veja informação de cozinha desatualizada ou fique preso a uma tela travada**.

## Critérios de aceite
- [x] Ao perder a conexão do socket, o app detecta o evento de desconexão do `socket.io-client` e exibe (opcionalmente) um indicador discreto de "reconectando".
- [x] O `socket.io-client` está configurado para reconectar automaticamente (retry/backoff padrão da biblioteca).
- [x] Assim que a conexão é restabelecida, o app faz um `GET` REST (`/api/kitchen/tickets?orderId=` e/ou `/api/orders/:id`) para recarregar o baseline antes de voltar a confiar nos deltas do WS.
- [x] Após o resync, o app reemite `subscribe` para as rooms que estavam ativas antes da queda.
- [x] Nenhuma tela trava indefinidamente esperando o socket: caso a reconexão demore, os dados exibidos continuam sendo os do último `GET` bem-sucedido.
- [ ] Cenário testável manualmente: desligar Wi-Fi/dados durante uma tela de cozinha aberta, religar, e confirmar que o status exibido bate com o backend.

## Escopo técnico
- Regra descrita em `.specs/01-arquitetura.md` ("Fallback: em rede de restaurante instável...") e `.specs/04-fluxos.md` (4.4 — "Ressincronização").
- Baseline via REST + deltas via WS é o modelo definido no contrato (`.specs/03-api-contrato.md`): "REST cobre o CRUD/baseline e o WS empurra os deltas".
- Interage com a camada offline (`expo-sqlite`, HU-28 do Sprint 3): dados do baseline REST devem também atualizar o cache local.

## Fora de escopo
- Resolução de conflito de edições feitas offline por dois operadores — é um risco em aberto do produto (`.specs/00-contexto-projeto.md`), não coberto nesta HU.

## Dependências
- HU-32 (App: cliente WebSocket) — a reconexão parte da conexão já estabelecida ali.

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (simulação de desconexão/reconexão)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
