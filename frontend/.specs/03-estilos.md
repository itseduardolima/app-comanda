# 03 · Estilos e sistema de design

> Como todo estilo visual do app é escrito. Vale para **todo código novo**, sem exceção.
>
> A identidade visual vem do protótipo **"App Garçom Fogo e Brasa"** (Claude Design). Os tokens em `src/theme/tokens.ts` são a transcrição fiel dele — protótipo e tokens não podem divergir.

## Fonte do design

O protótipo é a **fonte da verdade visual**. Divergência entre o app e o protótipo é bug do app, não do protótipo.

- **Projeto**: [Fogo e Brasa · Claude Design](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e)
- **Arquivo deste app**: [`App Garcom Fogo e Brasa.dc.html`](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa.dc.html)
- `projectId`: `0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e`

O mesmo projeto contém `PDV Fogo e Brasa.dc.html` e `Backoffice Fogo e Brasa.dc.html` — **fora do escopo** do app do garçom, que é o único produto do backlog atual.

### Como consultar o protótipo

Via MCP `claude_design` (`https://api.anthropic.com/v1/design/mcp`, autenticação com `/design-login`):

```
list_files  projectId=0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e
get_file    projectId=0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e  path="App Garcom Fogo e Brasa.dc.html"
```

O `.dc.html` é HTML estático com as 14 telas (`00`, `00A`, `00B`, `01`, `1A`, `1B`, `02`, `03`, `04`, `4A`–`4D`) e os valores de estilo literais. É de onde sai qualquer token novo.

### Telas do protótipo ↔ rotas do app

| Protótipo | Rota | Estilo |
|---|---|---|
| 00 Login | `app/(auth)/login.tsx` | `screens/login.styles.ts` |
| 00A Criar PIN | `app/(auth)/pin-create.tsx` | `screens/pin-create.styles.ts` |
| 00B Acesso rápido por PIN | `app/(auth)/pin-verify.tsx` | `screens/pin-verify.styles.ts` |
| 01 Comandas | `app/(tabs)/orders/index.tsx` | `screens/orders-list.styles.ts` |
| 1A Nova comanda | `app/orders/new.tsx` | `screens/order-new.styles.ts` |
| 1B Escolher mesa | `app/orders/pick-table.tsx` | `screens/pick-table.styles.ts` |
| 02 Anotar pedido / Cardápio | `app/(tabs)/menu/index.tsx` | `screens/menu.styles.ts` |
| 03 Personalizar item | `app/orders/[id]/customize.tsx` | `screens/customize-item.styles.ts` |
| 04 Detalhe da comanda | `app/orders/[id]/index.tsx` | `screens/order-detail.styles.ts` |
| 4A–4D status de cozinha | `app/orders/[id]/kitchen.tsx` | `screens/kitchen-status.styles.ts` |

### Ao mexer no visual

1. Abra o protótipo e pegue o valor **de lá**.
2. Se o valor não existe em `tokens.ts`, adicione **primeiro** ao token — com o nome semântico, não o nome da cor (`textFaint`, não `cinzaClaro`).
3. Só então use no `*.styles.ts`.

Exemplo do porquê: as etapas não atingidas do stepper de cozinha usam `#B4AEA4` (`textFaint`), não `#8C867C` (`textMuted`). A diferença é sutil e só o protótipo decide — foi exatamente aí que um teste desatualizado apontou "erro" no código que estava certo.

## Regra de ouro

**Nenhum estilo inline. Nunca.** JSX não carrega `style={{ … }}`.

Isso vale para **toda prop de estilo**, não só `style`: `contentContainerStyle`, `columnWrapperStyle`, `headerStyle`, `headerTitleStyle`, `contentStyle`. E vale fora do JSX também — as `screenOptions` do expo-router carregam objetos de estilo que nenhum seletor de JSX alcança; elas vivem em [`src/styles/navigation.styles.ts`](../src/styles/navigation.styles.ts).

Todo estilo vive em um arquivo `*.styles.ts` ao lado do componente/tela, construído com o helper `createStyles`.

```tsx
// ❌ proibido — o lint quebra o build
<View style={{ padding: 16, backgroundColor: '#F7F5F1' }} />
<View style={{ padding: theme.spacing.md }} />   // token não salva: continua inline

// ✅ correto
<View style={styles.container} />
```

O segundo caso também é proibido: usar token dentro de objeto inline resolve o problema de cor hardcoded, mas não o de estilo espalhado pelo JSX — e recria o objeto a cada render.

## O helper `createStyles`

`src/theme/create-styles.ts` recebe uma fábrica que ganha o tema e devolve um hook. O resultado passa por `StyleSheet.create` e é memoizado por tema.

```ts
// order-card.styles.ts
import { createStyles } from '../../theme/create-styles';

export const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
}));
```

```tsx
// order-card.tsx
import { useStyles } from './order-card.styles';

export function OrderCard() {
  const styles = useStyles();
  return <View style={styles.container} />;
}
```

## Onde cada arquivo de estilo mora

| O que | Arquivo de estilo | Exemplo |
|---|---|---|
| Componente (`src/components/**`) | **sibling**, na mesma pasta | `order-card/order-card.styles.ts` |
| Tela (`app/**`) | `src/styles/screens/<tela>.styles.ts` | `src/styles/screens/order-detail.styles.ts` |
| Navegador (`screenOptions`) | `src/styles/navigation.styles.ts` | `headerStyle`, `contentStyle` |

Telas não têm sibling porque `app/` é roteamento — o Expo Router trata cada arquivo daquela árvore como rota. Um `*.styles.ts` ali viraria rota fantasma.

Nome do arquivo de tela: descreve a tela, não o caminho. `app/orders/[id]/index.tsx` → `order-detail.styles.ts`, não `index.styles.ts`.

## Valores: só token

Cor, espaçamento, raio, fonte e tipografia saem **exclusivamente** de `theme.*`:

- `theme.colors.*` — nenhum hex literal fora de `tokens.ts`
- `theme.spacing.*` — `xs 4 · sm 8 · md 16 · lg 22 · xl 32 · xxl 48`
- `theme.radii.*` — `sm 10 · md 13 · lg 16 · xl 18 · pill 999`
- `theme.fonts.*` — Rubik `regular/medium/semibold/bold`
- `theme.typography.*` — escala pronta (`title`, `heading`, `subtitle`, `body`, `caption`, `label`, `button`)

Número cru só é aceito para **geometria de layout** que não é token: `flex: 1`, `width: 72` de um avatar, `borderWidth: 2`. Se um valor desses aparecer três vezes, virou token — promova para `tokens.ts`.

Precisa de uma cor que não existe? Ela sai do protótipo e entra em `tokens.ts` primeiro. Nunca direto no `.styles.ts`.

## Estilo condicional

Componha arrays, não objetos:

```tsx
// ✅
<Pressable style={[styles.chip, selected && styles.chipSelected]} />

// ✅ callback de Pressable
<Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} />
```

Cada variante é uma chave própria no arquivo de estilos (`chip`, `chipSelected`, `chipDisabled`). Ternário aninhado dentro de um objeto inline é o cheiro que esse padrão elimina.

### A única exceção

Valor derivado de dado em runtime — largura percentual de barra de progresso, altura calculada por medição. Só nesse caso o objeto inline é aceitável, **com comentário explicando por quê**:

```tsx
{/* largura vem do progresso do ticket, não dá para pré-computar */}
<View style={[styles.progressFill, { width: `${percent}%` }]} />
```

Repare que a exceção é um objeto **mínimo**, sobreposto ao estilo do arquivo — não um objeto de estilo inteiro inline.

## Variação visual ≠ estilo novo

Antes de escrever qualquer estilo, cheque se o caso já é atendido por `variant`/`size` dos componentes de `src/components/ui/`. Tela não estiliza botão, badge, card, chip, input ou texto na mão — ver `02-organizacao-pastas.md` § Regras.

## Como isso é garantido

- **Lint**: `eslint.config.js` tem regras `no-restricted-syntax` que rejeitam objeto de estilo inline em cinco formas — `style={{…}}`, dentro de array, dentro do callback de `Pressable`, em qualquer prop `*Style`, e em propriedade `*Style` de objeto de opções. Não é convenção de boa vontade — quebra o CI.
- **Definition of Done**: `../../.specs/05-padroes-de-codigo.md` exige lint limpo.

Se o lint acusar e você achar que é caso de exceção legítima (seção acima), use `// eslint-disable-next-line no-restricted-syntax` **com um comentário explicando o valor de runtime**. Um disable sem justificativa é bug de review.
