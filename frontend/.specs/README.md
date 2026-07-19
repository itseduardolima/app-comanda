# frontend/.specs · Especificações técnicas do frontend

> Specs **específicas da implementação do app** (React Native + Expo). Complementam — não substituem — o `.specs/` da raiz do projeto, que é o contrato compartilhado entre backend e frontend.
>
> Se algo aqui divergir do `.specs/` da raiz (telas, fluxos, contrato de API), **a raiz manda**: corrija este documento.

## Onde ler o quê

| Pergunta | Onde está a resposta |
|---|---|
| O que o produto faz, telas do MVP | [`../../.specs/00-contexto-projeto.md`](../../.specs/00-contexto-projeto.md) |
| Como o app fala com o backend (REST + WS) | [`../../.specs/01-arquitetura.md`](../../.specs/01-arquitetura.md) |
| Entidades e enums (o que vem da API) | [`../../.specs/02-modelo-de-dados.md`](../../.specs/02-modelo-de-dados.md) |
| Contrato exato dos endpoints e eventos WS | [`../../.specs/03-api-contrato.md`](../../.specs/03-api-contrato.md) |
| Fluxos de usuário (auth, comanda, cozinha, fechamento) | [`../../.specs/04-fluxos.md`](../../.specs/04-fluxos.md) |
| Convenções de código de todo o repo | [`../../.specs/05-padroes-de-codigo.md`](../../.specs/05-padroes-de-codigo.md) |
| Glossário código ↔ UI | [`../../.specs/06-glossario.md`](../../.specs/06-glossario.md) |
| **Como o código do app é organizado internamente** | [`01-arquitetura.md`](01-arquitetura.md) (este diretório) |
| **Estrutura de pastas e arquivos do app** | [`02-organizacao-pastas.md`](02-organizacao-pastas.md) (este diretório) |
| **Como escrever estilo (sem inline, tokens, `*.styles.ts`)** | [`03-estilos.md`](03-estilos.md) (este diretório) |
| **Onde fica o protótipo de design (fonte da verdade visual)** | [`03-estilos.md` § Fonte do design](03-estilos.md#fonte-do-design) |

## Índice

| Arquivo | Conteúdo |
|---|---|
| [`01-arquitetura.md`](01-arquitetura.md) | Camadas (rotas → hooks/stores → api/ws/db), offline-first, tema, i18n, navegação |
| [`02-organizacao-pastas.md`](02-organizacao-pastas.md) | Árvore de diretórios completa (`app/` e `src/`), convenção de nomes, onde cada tipo de arquivo vive |
| [`03-estilos.md`](03-estilos.md) | Padrão `*.styles.ts` + `createStyles`, proibição de estilo inline, tokens do protótipo Fogo e Brasa |

## Regra de ouro

Tela (`app/...`) nunca fala direto com `fetch`/`socket.io-client`/`expo-sqlite`. Toda tela consome **hooks** que leem de **stores** (Zustand), que por sua vez são alimentadas pelas camadas `src/api`, `src/ws` e `src/db`. Ver detalhes em `01-arquitetura.md`.
