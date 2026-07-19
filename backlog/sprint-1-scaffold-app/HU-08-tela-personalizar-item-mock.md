# HU-08 · Tela Personalizar item

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom (operador)**, quero **personalizar um item do pedido (retirar/adicionar ingredientes, ponto da carne, observação)**, para que **eu registre exatamente como o cliente quer o prato antes de enviar à cozinha**.

## Critérios de aceite
- [x] Tela 03 (Personalizar item) permite retirar ingredientes padrão do item e adicionar ingredientes extras (lista mockada por item).
- [x] Suporta seleção de ponto da carne quando aplicável ao item (ex.: mal passado/ao ponto/bem passado), oculto para itens sem essa opção.
- [x] Campo de observação livre (texto) para instruções adicionais.
- [x] Ao confirmar, o item é adicionado à comanda em edição com os modificadores escolhidos, no formato equivalente a `order_item.modifiers` (json).
- [x] Cancelar retorna ao Cardápio sem adicionar o item.
- [x] Textos de UI via i18n.

## Escopo técnico
- Referência: `.specs/00-contexto-projeto.md` (tela 03), `.specs/02-modelo-de-dados.md` (`order_item.modifiers`), exemplo de payload em `.specs/03-api-contrato.md` (`POST /api/orders/:id/items`).

## Fora de escopo
- Persistência real do item (API real entra na HU-27).
- Recalcular preço a partir do `menu_item` atual — nesta fase o preço final é apenas exibido, sem lógica de negócio real.

## Dependências
- HU-07

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
