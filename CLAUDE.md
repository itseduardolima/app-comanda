# CLAUDE.md

App do garçom para gerenciar comandas: monorepo com `backend/` (NestJS + Prisma + PostgreSQL, tempo real via Socket.IO) e `frontend/` (React Native + Expo Router).

Este arquivo cobre o que vale para o repo inteiro. Ao entrar numa das pastas, leia também o guia dela:

- [`backend/CLAUDE.md`](backend/CLAUDE.md) — anatomia de módulo Nest, DTOs, transações, dinheiro em centavos
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — camadas, padrão de estilo, offline-first, i18n

## Antes de escrever código

**`.specs/` é a fonte da verdade.** Leia a spec da área antes de mexer nela; se o código divergir da spec, é bug do código. Mudança de comportamento = atualizar a spec no mesmo commit.

| Vou mexer em… | Leia primeiro |
|---|---|
| qualquer coisa | [`.specs/05-padroes-de-codigo.md`](.specs/05-padroes-de-codigo.md) |
| entidade, enum, migration | [`.specs/02-modelo-de-dados.md`](.specs/02-modelo-de-dados.md) |
| endpoint ou evento WS | [`.specs/03-api-contrato.md`](.specs/03-api-contrato.md) |
| regra de negócio de fluxo | [`.specs/04-fluxos.md`](.specs/04-fluxos.md) |
| **estilo/visual do app** | [`frontend/.specs/03-estilos.md`](frontend/.specs/03-estilos.md) |
| estrutura de arquivo do app | [`frontend/.specs/02-organizacao-pastas.md`](frontend/.specs/02-organizacao-pastas.md) |
| camadas do app | [`frontend/.specs/01-arquitetura.md`](frontend/.specs/01-arquitetura.md) |

O trabalho é guiado pelo backlog em [`backlog/`](backlog/) (HU-01 … HU-48). Cada HU tem critérios de aceite — são eles que definem "pronto", não a sua leitura do pedido.

## Regras que não se negociam

- **Código em inglês, UI em português.** `Order` no código, "Comanda" na tela. Nenhuma string de UI hardcoded — tudo via `src/i18n/`.
- **Nenhum estilo inline no frontend.** JSX nunca carrega `style={{ … }}`. Todo estilo vive num `*.styles.ts` feito com `createStyles`; todo valor de cor/espaço/raio/fonte sai de `src/theme/tokens.ts`. O ESLint reprova — regra completa em [`frontend/.specs/03-estilos.md`](frontend/.specs/03-estilos.md).
- **O protótipo manda no visual.** [Fogo e Brasa no Claude Design](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e) — `App Garcom Fogo e Brasa.dc.html` (telas do MVP) e `App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html` (estados, movimento, KDS). Valor visual novo sai de lá, vira token, e só então entra num `.styles.ts`. Divergência app↔protótipo é bug do app.
- **Tela não fala com a rede.** `app/**` importa só de `src/hooks`; nunca de `src/api`, `src/ws` ou `src/db`.
- **Offline-first**: toda mutação do app tem que tolerar a rede caindo (escreve local em `expo-sqlite`, sincroniza depois).
- **Componente base é único**: `Button`, `Badge`, `Card`, `Text`, `Input`, `Chip` só existem em `src/components/ui/`. Variação visual nova = novo `variant`, não componente novo.
- **Nada de pagamento/cobrança** — fora de escopo do MVP por decisão de produto.
- **Commits**: Conventional Commits em inglês (`feat(orders): add closeOrder endpoint`). Sem trailer de co-autoria.

## Comandos

```bash
# frontend/
npm run typecheck && npm run lint && npm test
npx expo start

# backend/
npm run typecheck && npm run lint && npm test
npm run test:e2e              # precisa do Postgres de pé
docker compose up -d          # PostgreSQL 16
npx prisma migrate dev && npx prisma db seed
npm run start:dev             # http://localhost:3000/api
```

## Definition of Done

1. Critérios de aceite da HU atendidos.
2. `typecheck` e `lint` limpos — no frontend, lint limpo inclui zero estilo inline.
3. Testes relevantes passando (backend: unit + e2e; frontend: componente/hook com RNTL).
4. Spec em `.specs/` reflete o comportamento.
