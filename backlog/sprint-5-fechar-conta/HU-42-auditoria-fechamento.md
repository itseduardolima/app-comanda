# HU-42 · Auditoria: registrar operador que fechou a conta

**Sprint:** 5 — Fechar conta
**Épico:** Fechamento
**Camada:** Fullstack
**Story points:** 2

## História de usuário
Como **gerente do restaurante**, quero **saber qual operador fechou cada comanda**, para que **eu tenha rastreabilidade sobre quem marcou uma conta como paga, já que esse é um registro manual sem validação de pagamento real por trás**.

## Critérios de aceite
- [ ] O `operator_id` de quem executou `closeOrder` (HU-38) é persistido no `order` (campo já existente no modelo) e nunca sobrescrito após o fechamento.
- [ ] `GET /api/orders/:id` retorna, para comandas `paid`, os dados do operador que fechou (id e nome), sem exigir consulta extra no app.
- [ ] Na tela `04 Detalhe da comanda` (ou equivalente para comandas pagas), é exibido de forma visível "Fechada por: <nome do operador>" quando `payment_status: paid`.
- [ ] Se o operador autenticado no momento do fechamento for diferente do operador que abriu a comanda, ambos os dados continuam corretos e distintos (quem abriu vs. quem fechou).
- [ ] Não é possível fechar uma comanda sem um operador autenticado (o endpoint exige JWT válido — reforça o que já é regra geral da API).

## Escopo técnico
- Referência: `.specs/02-modelo-de-dados.md` ("Recomendação de auditoria: registrar `operator_id` de quem fechou — já presente no `order`"), `.specs/00-contexto-projeto.md` (risco "Fechar conta = registro manual... log de qual operador fechou").
- Reaproveita o `operator_id` do `order` (já parte do modelo de dados, sem nova tabela); ajuste é garantir que o valor gravado no fechamento é o do operador autenticado na chamada, e expor esse dado na resposta/])UI.
- Tela de detalhe da comanda no frontend (`frontend/app/orders/[id]/index.tsx`).

## Fora de escopo
- Qualquer trilha de auditoria mais ampla (log de todas as alterações da comanda) — esta HU cobre apenas o registro de fechamento.
- Tela dedicada de relatórios/gerência (não faz parte do escopo do MVP do app do garçom).

## Dependências
- HU-38 (endpoint `closeOrder`).

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (verifica que `operator_id` do fechamento é o do operador autenticado na chamada)
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
