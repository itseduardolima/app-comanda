# HU-20 · Backend: módulo Menu

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Backend
**Story points:** 3

## História de usuário
Como **garçom**, quero **consultar o cardápio completo (categorias e itens) pela API**, para que **eu possa anotar o pedido do cliente com dados reais em vez de mocks**.

## Critérios de aceite
- [x] `MenuModule` criado com `controller` → `service` → Prisma, seguindo a camada padrão do repo.
- [x] `GET /api/menu` retorna os itens do cardápio agrupados/anotados por categoria, incluindo `id`, `name`, `price`, `category` de cada `menu_item`.
- [x] `GET /api/menu/categories` retorna a lista de categorias distintas.
- [x] Ambas as rotas exigem `Authorization: Bearer <jwt>` (protegidas por guard), exceto se decidido o contrário para o cardápio (a confirmar com o time; se público, documentar a exceção).
- [x] Resposta em JSON com campos em inglês, seguindo o contrato de `03-api-contrato.md`.
- [x] Erros seguem o padrão NestJS (`{ statusCode, message, error }`).

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Menu — `MenuModule`), `.specs/02-modelo-de-dados.md` (entidade `menu_item`).

## Fora de escopo
- CRUD de criação/edição de itens do cardápio (não há tela nem endpoint definido para isso no MVP; cardápio é populado via seed/admin manual).

## Dependências
- HU-19 (setup NestJS + Prisma)

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
