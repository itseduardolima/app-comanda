# HU-23 · Backend: Orders — listar com filtro

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 2

## História de usuário
Como **garçom**, quero **listar as comandas filtrando por Abertas, Pagas ou Todas**, para que **eu enxergue rapidamente o que ainda precisa de atenção e o que já foi fechado**.

## Critérios de aceite
- [x] `GET /api/orders?status=open|paid|all` implementado no `OrdersModule`.
- [x] `status=open` retorna comandas com `payment_status = unpaid`; `status=paid` retorna `payment_status = paid`; `status=all` (ou parâmetro ausente) retorna todas.
- [x] Cada item da lista traz o suficiente para renderizar o card da tela `01 Comandas`: tipo, mesa/nome, status de pagamento e um resumo do status de cozinha dos itens.
- [x] Parâmetro `status` inválido retorna erro 400 com o padrão de erro NestJS.
- [x] Rota exige `Authorization: Bearer <jwt>`.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Orders — `GET /api/orders`), `.specs/00-contexto-projeto.md` (tela `01 Comandas` com filtros Abertas/Pagas/Todas).

## Fora de escopo
- Paginação (não especificada no MVP; volume de comandas por restaurante é pequeno).
- Ordenação customizável (usar `created_at desc` como padrão razoável).

## Dependências
- HU-22 (criar comanda)

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
