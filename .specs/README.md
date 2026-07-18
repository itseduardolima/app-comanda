# .specs · Especificações do projeto

> Fonte da verdade (spec of record) do **App do Garçom** — gerenciador de comandas genérico para restaurantes.
> ("Fogo & Brasa" é apenas a marca fictícia do protótipo de referência, não o alvo do produto — ver `00-contexto-projeto.md`.)
> Estas specs são compartilhadas por **backend** e **frontend** e definem o contrato entre eles.
> Ao mudar comportamento, atualize a spec **antes** ou **junto** do código.

O planejamento de alto nível vive em [`../PLANEJAMENTO.md`](../PLANEJAMENTO.md). Estas specs detalham o que aquele documento decide.

## Índice

| Arquivo | Conteúdo |
|---|---|
| [`00-contexto-projeto.md`](00-contexto-projeto.md) | O que é o produto, escopo, o que está **fora** de escopo |
| [`01-arquitetura.md`](01-arquitetura.md) | Visão de arquitetura, componentes e como se comunicam |
| [`02-modelo-de-dados.md`](02-modelo-de-dados.md) | Entidades, tabelas, colunas, enums |
| [`03-api-contrato.md`](03-api-contrato.md) | Contrato REST entre app e backend (endpoints, DTOs) |
| [`04-fluxos.md`](04-fluxos.md) | Fluxos de usuário (auth, comanda, cozinha, fechar conta) |
| [`05-padroes-de-codigo.md`](05-padroes-de-codigo.md) | Convenções válidas para **todo** o repositório |
| [`06-glossario.md`](06-glossario.md) | Glossário código (inglês) ↔ UI (português) |

## Regras de ouro do repositório

1. **Código em inglês, UI em português.** `Order` no código, "Comanda" na tela. Textos de UI ficam isolados em arquivos de i18n.
2. **Sem pagamento no app.** Não há adquirente, tap-to-pay nem webhook. "Pago" é apenas um flag de status (`payment_status`) definido manualmente ao "Fechar conta".
3. **TypeScript em todo lugar** — backend (NestJS) e frontend (React Native + Expo) compartilham a linguagem.
4. **A spec manda.** Divergência entre código e spec é bug: corrija o código ou atualize a spec, nunca deixe silenciosamente divergente.
