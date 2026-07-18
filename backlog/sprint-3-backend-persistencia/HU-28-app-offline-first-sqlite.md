# HU-28 · App: persistência offline (expo-sqlite) + fila de sync

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Frontend
**Story points:** 8

## História de usuário
Como **garçom**, quero **continuar anotando pedidos mesmo quando a rede do salão cair**, para que **eu não perca o pedido do cliente e ele seja sincronizado automaticamente quando a conexão voltar**.

## Critérios de aceite
- [ ] Camada `src/db/` com `expo-sqlite` armazena localmente comandas e itens (espelhando o essencial do modelo: `order`, `order_item`) como cache/baseline local.
- [ ] Toda mutação (criar comanda, adicionar/editar/remover item) é escrita primeiro localmente e enfileirada para sincronizar com o backend, mesmo sem rede no momento.
- [ ] Ao reconectar, a fila de sincronização é processada em ordem (FIFO) contra a API real, e o app confirma sucesso ou marca falha por item da fila.
- [ ] UI indica visualmente quando uma comanda/item ainda está "pendente de sincronização".
- [ ] Nenhuma mutação trava a UI esperando rede — toda ação do garçom responde imediatamente a partir do estado local.
- [ ] Comportamento coberto por pelo menos um teste simulando perda de conexão durante uma mutação.

## Escopo técnico
- Referências: `.specs/05-padroes-de-codigo.md` ("toda mutação deve tolerar rede caindo"), `.specs/01-arquitetura.md` (offline-first, `expo-sqlite`), `frontend/README.md` (`src/db/` — camada expo-sqlite + sincronização).

## Fora de escopo
- Resolução de conflito quando duas instâncias do app editam a mesma comanda offline (ponto em aberto registrado em `.specs/00-contexto-projeto.md`; não bloqueia esta HU, mas deve ser tratado como risco conhecido, não silenciosamente ignorado).
- Sincronização de eventos de cozinha em tempo real (WebSocket é da Sprint 4).

## Dependências
- HU-27 (integração de comandas com API real)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
