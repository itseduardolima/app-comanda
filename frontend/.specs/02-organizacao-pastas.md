# 02 · Organização de pastas do frontend

> Árvore de referência para o scaffold do app (Sprint 1 / Fase 1). Convenções de nome valem para todo código novo.

```
frontend/
  .specs/                          # este diretório (specs internas do frontend)
  app/                             # rotas — Expo Router (file-based)
    _layout.tsx                    # layout raiz: guard de sessão, ThemeProvider, i18n
    (auth)/
      _layout.tsx
      login.tsx                    # 00 Login
      pin-create.tsx               # 00A Criar PIN
      pin-verify.tsx               # 00B Acesso rápido por PIN
    (tabs)/
      _layout.tsx                  # tab bar: Comandas · Cardápio · Vendas · Perfil
      orders/
        index.tsx                 # 01 Comandas (filtros Abertas/Pagas/Todas)
      menu/
        index.tsx                 # 02 Cardápio (fora do fluxo de comanda, navegação livre)
      sales/
        index.tsx                 # Vendas
      profile/
        index.tsx                 # Perfil
    orders/
      new.tsx                     # 1A Nova comanda
      pick-table.tsx               # 1B Escolher mesa
      [id]/
        index.tsx                 # 04 Detalhe da comanda
        customize.tsx              # 03 Personalizar item
        kitchen.tsx                # 4A–4D status de cozinha (stepper conforme kitchen_status)

  src/
    api/
      client.ts                   # instância HTTP base (baseURL, header Authorization)
      auth.ts
      orders.ts
      menu.ts
      tables.ts
      kitchen.ts

    ws/
      client.ts                   # conexão socket.io-client, autenticação JWT no handshake
      use-kitchen-socket.ts       # hook: assina rooms e aplica deltas na store

    store/
      auth.store.ts
      orders.store.ts
      menu.store.ts
      tables.store.ts

    db/
      schema.ts                   # tabelas locais expo-sqlite
      sync-queue.ts                # fila de mutações offline + worker de sync
      migrations/

    i18n/
      pt-BR.ts
      index.ts

    theme/
      tokens.ts                   # cores, tipografia, espaçamento — configurável por marca
      theme-provider.tsx
      create-styles.ts            # helper dos *.styles.ts (ver 03-estilos.md)

    styles/
      screens/                     # estilo das telas — não pode ficar em app/ (viraria rota)
        login.styles.ts
        order-detail.styles.ts     # nome descreve a tela, não o caminho do arquivo de rota

    components/
      ui/                          # design system — sem regra de negócio, só visual
        button/
          button.tsx               # variant: primary|secondary|danger|ghost · size: sm|md|lg
          button.styles.ts         # todo componente tem seu sibling de estilo
          button.test.tsx
        badge/
          badge.tsx                # variant: paid|unpaid|queued|preparing|ready|delivered
          badge.test.tsx
        card/
          card.tsx
        text/
          text.tsx                 # variant: title|body|caption — tipografia central
        input/
          input.tsx
        chip/
          chip.tsx

      order-card/                  # componente de domínio — compõe peças de ui/
        order-card.tsx
        order-card.test.tsx
      menu-item-card/
        ...
      kitchen-status-stepper/      # compõe badge (ui/) por status
        ...

    hooks/
      use-orders.ts
      use-auth.ts
      use-menu.ts
      use-tables.ts

    types/
      order.ts                    # tipos espelhando .specs/02-modelo-de-dados.md e 03-api-contrato.md
      menu.ts
      table.ts

  app.json
  eas.json
  tsconfig.json
  package.json
```

## Convenções de nome

| Tipo | Convenção | Exemplo |
|---|---|---|
| Rota (`app/`) | kebab-case, espelha a tela do spec | `pick-table.tsx`, `[id]/customize.tsx` |
| Componente (pasta + arquivo) | kebab-case na pasta, `PascalCase` no export da função | `order-card/order-card.tsx` exporta `OrderCard` |
| Hook | `use-<algo>.ts`, export `useAlgo` | `use-orders.ts` → `useOrders()` |
| Store | `<dominio>.store.ts` | `orders.store.ts` |
| Teste | `<arquivo>.test.ts(x)` ao lado do arquivo testado | `order-card.test.tsx` |
| Variável/função/tipo | camelCase / PascalCase, inglês | `closeOrder`, `KitchenStatus` |
| String de UI | nunca hardcoded — sempre via `src/i18n` | — |
| Estilo de componente | `<componente>.styles.ts` ao lado do `.tsx` | `order-card/order-card.styles.ts` |
| Estilo de tela | `src/styles/screens/<tela>.styles.ts`, nome descritivo | `app/orders/[id]/index.tsx` → `order-detail.styles.ts` |

## Regras

- Tela em `app/` não importa de `src/api`, `src/ws` ou `src/db` diretamente — só de `src/hooks`.
- Todo componente novo reutilizável ganha sua própria pasta em `src/components/`, mesmo que hoje só tenha um arquivo — facilita colocar teste/variantes depois.
- Cores, espaçamento e tipografia só existem como token em `src/theme/tokens.ts` — nenhum valor de cor/fonte hardcoded dentro de um componente.
- **Nenhum estilo inline.** JSX nunca carrega `style={{ … }}`; todo estilo vive num `*.styles.ts` feito com `createStyles`. Regra completa em [`03-estilos.md`](03-estilos.md) — o ESLint quebra o build se escapar.
- Tipo que representa uma entidade da API (`Order`, `MenuItem`, `Table`) vive em `src/types/` e deve bater com `.specs/02-modelo-de-dados.md` e `.specs/03-api-contrato.md` da raiz — divergência é bug.
- **`src/components/ui/` é o único lugar onde `Button`, `Badge`, `Card`, `Text`, `Input`, `Chip` existem.** Nenhuma tela ou componente de domínio recria um botão/badge estilizado na mão — todos importam e passam `variant`/`size`. Ver regra completa em `01-arquitetura.md` § "Reuso: componentes base, cores e variantes".
- Variação visual nova = novo valor de `variant` no componente existente (e um novo token de cor em `theme/tokens.ts`, se for o caso) — não um componente novo em `ui/`.
