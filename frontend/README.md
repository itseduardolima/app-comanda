# Frontend · App do Garçom (gerenciador de comandas)

App do garçom para iOS e Android a partir de **um único código-fonte** — produto **genérico** para restaurantes (marca/tema configurável, não fixa no código). **React Native + Expo (TypeScript)**.

> Contexto completo e telas em [`../.specs/`](../.specs/). Este README é o guia de desenvolvimento **do app**. Leia primeiro `../.specs/00-contexto-projeto.md` (telas) e `../.specs/04-fluxos.md`.

## Papel deste cliente

App que o garçom usa na mesa: login por PIN, abrir/organizar comandas, anotar pedido pelo cardápio, personalizar item, acompanhar cozinha por item e **fechar conta** (marca como paga). Feito para **rede instável de salão** → **offline-first**.

## Tecnologias

| Área | Escolha |
|---|---|
| Framework | **React Native + Expo** |
| Linguagem | **TypeScript** (`strict`) |
| Navegação | **Expo Router** (file-based) ou React Navigation |
| Estado | **Zustand** (global); cache de servidor por queries |
| Tempo real | cliente **WebSocket** com `socket.io-client` (status de cozinha/comandas empurrados pelo Gateway) |
| Offline | **expo-sqlite** + fila de sincronização |
| i18n | textos de UI isolados (pt-BR) |
| Build/distribuição | **EAS** (Expo Application Services) — iOS + Android + OTA |
| Testes | React Native Testing Library + Jest |

## Estrutura sugerida (Expo Router)

Pastas de rota espelham as telas do `../.specs/00-contexto-projeto.md`:

```
app/
  (auth)/
    login.tsx           # 00 Login
    pin-create.tsx      # 00A Criar PIN
    pin-verify.tsx      # 00B Acesso rápido por PIN
  (tabs)/
    orders/             # 01 Comandas (Abertas/Pagas/Todas)
    menu/               # 02 Cardápio
    sales/              # Vendas
    profile/            # Perfil
  orders/
    new.tsx             # 1A Nova comanda
    pick-table.tsx      # 1B Escolher mesa
    [id]/index.tsx      # 04 Detalhe da comanda
    [id]/customize.tsx  # 03 Personalizar item
    [id]/kitchen.tsx    # 4A–4D status de cozinha
src/
  api/        # cliente REST (ver ../.specs/03-api-contrato.md)
  ws/         # cliente WebSocket — assina rooms, aplica deltas nas stores
  store/      # stores Zustand
  db/         # camada expo-sqlite + sincronização
  i18n/       # textos em português
  theme/      # cores e tipografia do protótipo
  components/ # componentes reutilizáveis
```

## Padrões de desenvolvimento

- **Código em inglês; UI em português** via i18n — nenhuma string de tela hardcoded. Ver `../.specs/06-glossario.md` (`Order` no código, "Comanda" na tela).
- Componentes funcionais + hooks; sem class components.
- **Offline-first**: toda mutação escreve local e sincroniza; deve tolerar rede caindo.
- Status de cozinha em **tempo real via WebSocket**: cliente WS assina a comanda/mesa e recebe os deltas; ao (re)conectar, faz um `GET` REST de baseline (ver `../.specs/04-fluxos.md` e `03-api-contrato.md`).
- Tema/marca **configurável** (cores, tipografia, nome, logo) via `src/theme/` — o protótipo `App Garcom Fogo e Brasa.dc.html` é só um exemplo de tema, não a marca fixa do app.

## Setup

Pré-requisitos: Node 20+, backend rodando (ver `../backend/README.md`).

```bash
npm install

# apontar o app para o backend (padrão: http://localhost:3000)
# — em dispositivo físico, troque em app.json > expo.extra.apiUrl/wsUrl
#   pelo IP da máquina na rede local (ex.: http://192.168.0.10:3000/api)

npx expo start          # dev (Expo Go / simulador iOS / emulador Android)

# qualidade
npm run typecheck       # tsc --noEmit (strict)
npm run lint            # expo lint
npm test                # jest (componentes, stores, i18n)
```

Operador de demonstração (seed do backend): usuário `demo`, PIN `1234`;
usuários `joao` e `maria` caem no fluxo de 1º acesso (criar PIN).

### Tema / marca

A marca é **configuração**, não código: nome, cores, tipografia e espaçamentos
vivem em `src/theme/tokens.ts` (o tema "Fogo & Brasa" é só o exemplo do
protótipo). O MVP suporta **apenas modo claro** — decisão documentada em
`tokens.ts` (uso em salão iluminado); dark mode entra como um segundo objeto
de tokens quando necessário.

### Build de loja (EAS)

Perfis em `eas.json`: `development` (dev client), `preview` (distribuição
interna) e `production` (loja, com `autoIncrement` e canal OTA `production`).

```bash
npx eas build --platform android --profile production   # .aab
npx eas build --platform ios --profile production       # .ipa
npx eas update --channel production                     # OTA de correções JS
```

> Segredos de produção (ex.: `API_URL`) via **EAS Secrets/env**, nunca
> hardcoded no repositório. Publicação nas lojas: ver backlog Sprint 6
> (HU-44/HU-45).
