# 05 · Padrões de código (todo o repositório)

## Idioma

- **Código em inglês**: módulos, classes, variáveis, funções, arquivos, endpoints, tabelas, colunas, mensagens de commit e comentários.
- **UI em português**: textos de tela isolados em arquivos de **i18n**. `Order` no código, "Comanda" na tela.
- Ver mapa completo em [`06-glossario.md`](06-glossario.md).

## Linguagem e tipagem

- **TypeScript** em backend e frontend. `strict: true`.
- Sem `any` implícito; prefira tipos/DTOs explícitos no contrato da API.

## Git / commits

- **Conventional Commits** em inglês: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
  - Ex.: `feat(orders): add closeOrder endpoint`.
- Uma mudança de comportamento = atualizar a spec correspondente em `.specs/` no mesmo PR.
- Branches: `feat/<tema>`, `fix/<tema>`.

## Backend (NestJS)

- Um **módulo Nest por domínio** (`Auth`, `Orders`, `Menu`, `Tables`, `Kitchen`).
- Camadas: `controller` (HTTP) → `service` (regra de negócio) → **Prisma**.
- **DTOs** com `class-validator` para toda entrada; nunca confiar no corpo cru.
- Injeção de dependência do Nest; sem singletons manuais.
- Erros via exceções do Nest (`NotFoundException`, `UnauthorizedException`, ...).
- **ORM**: **Prisma**. Schema em `prisma/schema.prisma`; acesso via `PrismaService` injetado (nunca instanciar `PrismaClient` avulso). Migrations com `prisma migrate`, versionadas.

## Frontend (React Native + Expo)

- Componentes funcionais + hooks. Sem class components.
- Navegação por **Expo Router** (file-based) — pastas de rota espelham as telas do `.specs`.
- Estado global em **Zustand**; estado de servidor pode usar cache/queries.
- **Offline-first**: escrever local (`expo-sqlite`) e sincronizar; toda mutação deve tolerar rede caindo.
- Nada de string de UI hardcoded — usar i18n.

## Testes

- Backend: testes de unidade dos services e e2e dos controllers (Jest + Supertest).
- Frontend: testes de componente/hook com React Native Testing Library.
- Todo bug corrigido ganha um teste de regressão quando viável.

## Definição de "pronto" (Definition of Done)

1. Código em inglês, UI via i18n.
2. Tipos passam (`tsc`), lint limpo.
3. Testes relevantes passando.
4. Spec em `.specs/` reflete o comportamento.
5. Nenhuma lógica de pagamento/cobrança introduzida (fora de escopo).
