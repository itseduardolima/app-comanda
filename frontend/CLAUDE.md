# CLAUDE.md · frontend

App React Native + Expo (SDK 57) com Expo Router, Zustand, offline-first em `expo-sqlite` e tempo real via Socket.IO. Android e iOS a partir do mesmo código.

Leia primeiro o [`CLAUDE.md` da raiz](../CLAUDE.md) — as regras de todo o repo valem aqui também.

## Onde ler o quê

| Vou mexer em… | Leia primeiro |
|---|---|
| **estilo, cor, espaçamento, qualquer coisa visual** | [`.specs/03-estilos.md`](.specs/03-estilos.md) |
| camadas, tema, i18n, navegação | [`.specs/01-arquitetura.md`](.specs/01-arquitetura.md) |
| onde criar arquivo novo | [`.specs/02-organizacao-pastas.md`](.specs/02-organizacao-pastas.md) |
| o que a API devolve | [`../.specs/03-api-contrato.md`](../.specs/03-api-contrato.md) — se `src/types/` divergir dele, é bug |
| regra de negócio de fluxo | [`../.specs/04-fluxos.md`](../.specs/04-fluxos.md) |

## Camadas

```
app/**              rotas (Expo Router)  → só importa de src/hooks e src/components
  ↓
src/hooks/          use-orders, use-menu, use-tables, use-auth, use-kitchen-socket
  ↓
src/store/          Zustand: orders.store, menu.store, tables.store, auth.store
  ↓
src/api/  src/ws/  src/db/    REST · Socket.IO · SQLite
```

A seta não pula etapa. **Tela nunca importa `src/api`, `src/ws` ou `src/db`** — se você precisou disso, o que falta é um hook.

## Regras que não se negociam

- **Nenhum estilo inline.** JSX não carrega `style={{ … }}`; todo estilo vive num `*.styles.ts` feito com `createStyles`. Componente → sibling na mesma pasta; tela → `src/styles/screens/<tela>.styles.ts` (não pode ficar em `app/`, viraria rota). O ESLint quebra o build. Detalhes e a única exceção: [`.specs/03-estilos.md`](.specs/03-estilos.md).
- **Cor, espaço, raio e fonte só via `theme.*`.** Nenhum hex fora de `src/theme/tokens.ts`. Valor novo sai do protótipo, vira token, e só então entra num `.styles.ts`.
- **O protótipo manda no visual.** [Fogo e Brasa no Claude Design](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e) → `App Garcom Fogo e Brasa.dc.html`. As 14 telas mapeadas para rotas em [`.specs/03-estilos.md` § Fonte do design](.specs/03-estilos.md#fonte-do-design).
- **Marca é tema, não código.** Nome, monograma e cores vêm de `theme.brand` / tokens. "Fogo & Brasa" é exemplo — nada de churrascaria hardcoded em componente.
- **Nenhuma string de UI hardcoded.** Todo texto visível vem de `src/i18n/pt-BR.ts` via `t()`, mesmo sendo pt-BR only.
- **UI kit é único**: `Button`, `Badge`, `Card`, `Text`, `Input`, `Chip` só existem em `src/components/ui/`. Tela não estiliza botão na mão. Variação visual nova = novo `variant`/`size` no componente existente.
- **Offline-first**: mutação de salão (criar comanda, add/editar/remover item) escreve local **primeiro** e entra na fila FIFO de `src/db/sync-queue.ts`. Toda mutação nova precisa decidir conscientemente se entra na fila.
  - **Exceções deliberadas, online-only**: enviar à cozinha, fechar conta e marcar entregue. Estão documentadas no topo de `sync-queue.ts` com o porquê — não as coloque na fila "por consistência".
- **Dinheiro chega em centavos (`Int`) da API.** Converta só na hora de exibir; não guarde float no estado.
- **Componente novo ganha pasta própria** em `src/components/<nome>/`, mesmo com um arquivo só.

## Comandos

```bash
npx expo start                    # Expo Go / simulador
npm run typecheck && npm run lint && npm test
```

`npm run lint` limpo inclui **zero estilo inline** — é regra automática, não revisão manual.

## Testes

React Native Testing Library, arquivo `.test.tsx` ao lado do testado. Cobertura atual: UI kit, componentes de domínio, i18n e `orders.store` (incluindo cenário de queda de conexão).

Ao testar componente, prefira asserção por **comportamento e testID** a asserção por string de estilo — mas quando a cor *é* o comportamento (estado do stepper de cozinha, por exemplo), asserte contra `defaultTheme.colors.*`, nunca contra um hex literal.

**Não existe teste de tela/rota** (`app/**`). Se você mexer numa tela e puder deixar o primeiro, deixe.

## Dívidas conhecidas (não são "como deve ser")

- Sem teste de rota, como dito acima.
- Sem Sentry / monitoramento de erros (HU-48 pendente).
- Sem config de Prettier no projeto, apesar da devDependency.
- Só tema claro — `tokens.ts` documenta a decisão; dark mode implicaria revisitar o protótipo.
