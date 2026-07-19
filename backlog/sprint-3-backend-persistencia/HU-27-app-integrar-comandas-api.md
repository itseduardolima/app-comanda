# HU-27 · App: integrar Nova comanda/Escolher mesa/Detalhe com API real

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom**, quero **que abrir uma nova comanda, escolher mesa e ver/editar o detalhe da comanda funcionem contra o backend real**, para que **meu trabalho no salão seja persistido de verdade, não apenas simulado em memória**.

## Critérios de aceite
- [x] Tela Nova comanda (`1A`, HU-05) chama `POST /api/orders` ao confirmar tipo/mesa/nome.
- [x] Tela Escolher mesa (`1B`, HU-06) consome `GET /api/tables` para o grid Livre/Ocupada real.
- [x] Tela Detalhe da comanda (`04`, HU-09) consome `GET /api/orders/:id` e usa `POST/PATCH/DELETE /api/orders/:id/items(/:itemId)` para adicionar, editar e remover itens.
- [x] Todos os mocks estáticos dessas três telas são substituídos pelas chamadas reais (mock pode virar fixture de teste).
- [ ] Estados de loading/erro tratados de forma consistente entre as três telas.
- [ ] Fluxo completo testável manualmente: abrir comanda → adicionar item → ver total atualizado no detalhe.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (Orders e Tables), `.specs/04-fluxos.md` (fluxo 4.2 — comanda no salão).

## Fora de escopo
- Persistência offline e fila de sincronização (HU-28).
- Envio para cozinha e acompanhamento de status (Sprint 4).

## Dependências
- HU-22, HU-23, HU-24, HU-25 (backend Orders), HU-21 (backend Tables), Sprint 1 HU-05/HU-06/HU-09 (telas mockadas)

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
