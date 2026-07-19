# HU-62 · KDS: avanço de estágio e resiliência em tempo real

**Sprint:** 8 — KDS e escala
**Épico:** Display de Cozinha (KDS)
**Camada:** Fullstack
**Story points:** 5

## História de usuário
Como **cozinheiro**, quero **que um toque avance o ticket de estágio e que a tela continue correta mesmo com o Wi-Fi oscilando**, para que **o salão veja "pronto" no mesmo instante e a fila da parede nunca minta**.

## Critérios de aceite
- [ ] Nova **room de cozinha** no gateway (ex.: `kitchen`), com `subscribe`/`unsubscribe` aceitando `{ kitchen: true }` — hoje só existem `order:<id>` e `table:<id>`.
- [ ] `kitchen.ticket.created` passa a ser emitido **também** na room de cozinha (além da room da comanda), com o ticket completo — o KDS mostra o ticket novo sem chamar REST.
- [ ] `item.status.changed` passa a ser emitido **também** na room de cozinha, para que dois tablets (ou o app do garçom) reflitam o mesmo avanço.
- [ ] Um evento novo `kitchen.ticket.closed` (ou equivalente documentado) informa que todos os itens do ticket chegaram a `delivered` e o cartão deve sair das colunas.
- [ ] Somente sujeitos autorizados entram na room de cozinha: token de dispositivo (HU-60) ou operador autenticado; token inválido é recusado no handshake, como já ocorre hoje.
- [ ] Tocar o botão do cartão avança **todos os itens do ticket** para o próximo estágio via `PATCH /api/kitchen/items/:itemId`, respeitando a sequência **estrita** `queued → preparing → ready → delivered`.
- [ ] A sequência **nunca pula etapa e nunca volta**: não existe desfazer no KDS, nem gesto, nem botão secundário. Tentativa de transição inválida responde **409** e o cartão volta ao estado real.
- [ ] Avanço é **otimista**: o cartão muda de coluna imediatamente; se a requisição falhar, ele volta para a coluna anterior com um aviso visível no próprio cartão — nunca um erro silencioso.
- [ ] Toque repetido no mesmo botão (mão pesada, duplo toque) não gera duas transições: a ação é idempotente por ticket + estágio de destino enquanto a primeira está em voo.
- [ ] Queda de conexão: o KDS mostra uma faixa persistente "Sem conexão" no cabeçalho, mantém a fila na tela (não esvazia) e **enfileira** os avanços feitos offline, drenando-os na ordem ao reconectar.
- [ ] Ao reconectar, o KDS faz **ressincronização por REST** (`GET /api/kitchen/tickets` do dia) antes de voltar a confiar nos eventos, descartando o estado divergente — mesma estratégia da HU-33.
- [ ] Eventos duplicados ou fora de ordem não corrompem a tela: aplicar um `item.status.changed` mais antigo que o estado atual é no-op.
- [ ] `.specs/03-api-contrato.md` atualizado no mesmo commit com a room `kitchen`, os eventos novos e os filtros de `GET /api/kitchen/tickets` — **isto é mudança de contrato**.
- [ ] Testes cobrem: broadcast na room de cozinha, transição fora de sequência → 409, avanço otimista revertido em falha, e cenário de perda de conexão com drenagem da fila ao voltar.

## Escopo técnico
- `backend/src/kitchen/kitchen.gateway.ts` já tem rooms por comanda e por mesa e emite `item.status.changed`, `order.updated` (com `change` discriminado) e `kitchen.ticket.created`; a room de cozinha é o que falta.
- O gateway continua **read-only por design**: toda mutação passa por REST, o WebSocket só difunde estado já persistido.
- Referências: molduras 6A (um botão por cartão, sequência estrita, sem desfazer) e 6C·1 (estado sem conexão); HU-33 (reconexão e ressincronização).

## Fora de escopo
- "Chamar garçom" — depende de push, device token e "garçom responsável pela mesa", que não existem no modelo (registrado também na HU-61).
- Cancelar ou devolver item pela cozinha.
- Priorização manual de tickets (arrastar para o topo) — a fila é FIFO.
- Métricas/tempo médio de preparo.

## Dependências
- HU-61 (fila de tickets do KDS), HU-60 (acesso do dispositivo), HU-31 (gateway), HU-30 (atualizar status do item)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
