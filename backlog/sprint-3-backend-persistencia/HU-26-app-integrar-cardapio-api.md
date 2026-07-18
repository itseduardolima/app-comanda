# HU-26 · App: integrar Cardápio com API real

**Sprint:** 3 — Backend & persistência
**Épico:** Núcleo de Dados
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom**, quero **que a tela de Cardápio mostre os itens e categorias reais vindos do backend**, para que **eu anote pedidos com o cardápio de verdade do restaurante, não com dados mockados**.

## Critérios de aceite
- [ ] Tela Cardápio (`02`, criada na HU-07 com mock) passa a consumir `GET /api/menu` e `GET /api/menu/categories` via o cliente REST em `src/api/`.
- [ ] Estado de carregamento (loading) exibido enquanto a requisição está em andamento.
- [ ] Estado de erro tratado (ex.: sem rede, backend fora) com mensagem amigável em português (i18n), sem crashar a tela.
- [ ] Estrutura de dados mockada anterior é removida da tela (o mock pode continuar existindo como fixture de teste, mas não é mais a fonte da UI).
- [ ] Nenhuma string de tela hardcoded — segue i18n.

## Escopo técnico
- Referências: `.specs/03-api-contrato.md` (seção Menu), `frontend/README.md` (`src/api/` — cliente REST).

## Fora de escopo
- Cache offline do cardápio (entra na HU-28, persistência offline mais ampla).

## Dependências
- HU-20 (backend: módulo Menu), Sprint 1 HU-07 (tela Cardápio mockada)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
