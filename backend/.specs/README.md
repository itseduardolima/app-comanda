# backend/.specs · Especificações técnicas do backend

> Specs **específicas da implementação do backend** (NestJS). Complementam — não substituem — o `.specs/` da raiz do projeto, que é o contrato compartilhado entre backend e frontend.
>
> Se algo aqui divergir do `.specs/` da raiz (endpoints, modelo de dados, enums), **a raiz manda**: corrija este documento.

## Onde ler o quê

| Pergunta | Onde está a resposta |
|---|---|
| O que o produto faz, o que está fora de escopo | [`../../.specs/00-contexto-projeto.md`](../../.specs/00-contexto-projeto.md) |
| Como backend e frontend se comunicam (REST + WS) | [`../../.specs/01-arquitetura.md`](../../.specs/01-arquitetura.md) |
| Entidades, colunas, enums | [`../../.specs/02-modelo-de-dados.md`](../../.specs/02-modelo-de-dados.md) |
| Contrato exato dos endpoints e eventos WS | [`../../.specs/03-api-contrato.md`](../../.specs/03-api-contrato.md) |
| Convenções de código de todo o repo | [`../../.specs/05-padroes-de-codigo.md`](../../.specs/05-padroes-de-codigo.md) |
| **Como o código do backend é organizado internamente** | [`01-arquitetura.md`](01-arquitetura.md) (este diretório) |
| **Estrutura de pastas e arquivos do backend** | [`02-organizacao-pastas.md`](02-organizacao-pastas.md) (este diretório) |

## Índice

| Arquivo | Conteúdo |
|---|---|
| [`01-arquitetura.md`](01-arquitetura.md) | Camadas (controller → service → Prisma), padrão de módulo, auth/guards, WebSocket Gateway, validação, erros |
| [`02-organizacao-pastas.md`](02-organizacao-pastas.md) | Árvore de diretórios completa, convenção de nomes, onde cada tipo de arquivo vive |

## Regra de ouro

Todo módulo novo (`src/<dominio>/`) segue o mesmo padrão descrito em `01-arquitetura.md`. Não criar estrutura ad-hoc por módulo — consistência entre `auth/`, `orders/`, `menu/`, `tables/`, `kitchen/` é o que torna o backend fácil de navegar conforme cresce.
