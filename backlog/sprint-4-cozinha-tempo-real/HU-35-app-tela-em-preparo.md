# HU-35 · App: tela Em preparo

**Sprint:** 4 — Cozinha em tempo real
**Épico:** Cozinha
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **garçom (operador)**, quero **ver quais itens estão sendo preparados e há quanto tempo**, para que **eu possa informar o cliente sobre o andamento do pedido sem precisar perguntar na cozinha**.

## Critérios de aceite
- [x] Tela 4B lista os `order_item` com `kitchen_status = preparing` ("na chapa"), com nome do item e quantidade.
- [x] Cada item exibe o tempo decorrido desde que entrou em `preparing` (contador ao vivo, ex.: "há 6 min").
- [x] A lista atualiza em tempo real via WebSocket quando um item muda de `queued` para `preparing` ou de `preparing` para `ready` (sai da lista).
- [x] Itens com outros status (`queued`, `ready`, `delivered`) não aparecem nesta lista.
- [x] Todos os textos vêm de i18n (pt-BR).

## Escopo técnico
- Tela `4B Em preparo` conforme `.specs/00-contexto-projeto.md`.
- Cálculo do tempo decorrido é local ao cliente (a partir do timestamp de transição de status), sem endpoint dedicado adicional.
- Consome a mesma store/room de cozinha assinada na HU-34 (mesma comanda).

## Fora de escopo
- Persistir/exibir tempo médio histórico de preparo (métrica de "Vendas"/relatórios) — fora do escopo do MVP.

## Dependências
- HU-32 (App: cliente WebSocket), HU-34 (App: tela Enviado à cozinha) — compartilham a mesma assinatura de room.

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
