# HU-05 · Tela Nova comanda

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **garçom (operador)**, quero **escolher o tipo de comanda (Mesa, Balcão-Retirada ou Delivery) e opcionalmente um nome**, para que **eu inicie corretamente o atendimento de acordo com a modalidade do pedido**.

## Critérios de aceite
- [ ] Tela 1A (Nova comanda) apresenta as três opções de tipo: **Mesa (`dine_in`) / Balcão-Retirada (`counter`) / Delivery (`delivery`)**.
- [ ] Campo de nome do cliente é opcional em todos os tipos.
- [ ] Selecionar **Mesa** navega para a tela 1B (Escolher mesa — HU-06).
- [ ] Selecionar **Balcão-Retirada** ou **Delivery** cria a comanda mockada diretamente e navega para o Cardápio (HU-07), sem passar pela escolha de mesa.
- [ ] Validação mínima: não permite avançar sem selecionar um tipo.
- [ ] Textos de UI via i18n, valores internos (`dine_in`/`counter`/`delivery`) em inglês.

## Escopo técnico
- Referência: `.specs/04-fluxos.md` (4.2 Fluxo de comanda), `.specs/06-glossario.md` (tradução de `order.type`).

## Fora de escopo
- Criação real via API (`POST /api/orders`) — fica para HU-27.
- Regras de múltiplas comandas por mesma mesa em detalhe (tratado a partir da HU-06/HU-09).

## Dependências
- HU-03

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
