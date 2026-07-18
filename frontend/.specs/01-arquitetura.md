# 01 · Arquitetura interna do frontend

> Como o código dentro de `frontend/app/` e `frontend/src/` é organizado. Para o desenho de alto nível (REST + WS entre app e backend), ver [`../../.specs/01-arquitetura.md`](../../.specs/01-arquitetura.md).

## Camadas

```
app/ (telas, Expo Router)
   → hooks (src/hooks)
      → stores (src/store, Zustand)
         → src/api (REST)  |  src/ws (WebSocket)  |  src/db (expo-sqlite)
```

- **Telas (`app/`)**: só layout e composição de componentes. Não chamam `fetch`, `socket.io-client` ou `expo-sqlite` diretamente. Leem estado e disparam ações através de **hooks**.
- **Hooks (`src/hooks`)**: ponte entre tela e store — ex. `useOrders()` lê de `orders.store` e expõe ações (`createOrder`, `closeOrder`) que a tela chama sem saber se a origem é rede, cache local ou socket.
- **Stores (`src/store`, Zustand)**: estado global por domínio (`auth.store`, `orders.store`, `menu.store`, `tables.store`). É a **única fonte de verdade em memória** que as telas leem.
- **`src/api`**: cliente REST (um arquivo por domínio, espelhando `../../.specs/03-api-contrato.md`). Só faz requests e retorna dados tipados — nunca decide regra de negócio.
- **`src/ws`**: cliente `socket.io-client`. Conecta autenticado (JWT no handshake), assina rooms (`order:<id>` / `table:<id>`) e traduz eventos recebidos em atualizações direto nas stores.
- **`src/db`**: camada `expo-sqlite` — schema local e fila de sincronização (`sync-queue`).

Regra: uma store nunca importa de `app/`; a dependência é sempre de fora para dentro (tela → hook → store → api/ws/db), nunca o contrário.

## Offline-first

- Toda mutação (criar comanda, adicionar item, marcar entregue, fechar conta) escreve **primeiro no `expo-sqlite`** e enfileira um registro em `sync-queue`; a tela reage imediatamente ao estado local.
- Um worker de sincronização (`src/db/sync-queue.ts`) drena a fila contra o REST quando há conexão; ao falhar, mantém o item na fila e tenta de novo.
- Eventos do WebSocket (`item.status.changed`, `order.updated`, `kitchen.ticket.created`) atualizam a store diretamente — são deltas, não passam pela fila de sync (que é só para mutações originadas no próprio app).
- Ao reconectar o socket, o app sempre refaz um `GET` REST de baseline **antes** de voltar a aceitar deltas (ver `../../.specs/04-fluxos.md`), para nunca aplicar delta sobre estado desatualizado.
- Conflito (duas edições offline da mesma comanda) é resolvido no worker de sync — ver ponto em aberto em `../../.specs/00-contexto-projeto.md`; até isso ser decidido, a política default é "last write wins" por `order_item`.

## Navegação (Expo Router)

- Roteamento **file-based**: pastas em `app/` espelham as telas do `../../.specs/00-contexto-projeto.md`.
- Grupos de rota: `(auth)` (Login/Criar PIN/Acesso rápido, sem tab bar) e `(tabs)` (Comandas/Cardápio/Vendas/Perfil, com tab bar). Cada grupo tem seu próprio `_layout.tsx`.
- Telas de detalhe fora dos grupos (`orders/new.tsx`, `orders/pick-table.tsx`, `orders/[id]/...`) empilham sobre a tab ativa.
- Guard de sessão: o `_layout.tsx` raiz redireciona para `(auth)` se não houver JWT válido em `auth.store` (ver Sprint 2, HU-18).

## Tema e i18n

- **Tema configurável** (`src/theme/tokens.ts` + `ThemeProvider`): cores, tipografia, nome e logo não são hardcoded em componentes — o produto é genérico, a marca (ex. "Fogo & Brasa") é só um tema de exemplo.
- **i18n** (`src/i18n/`): nenhuma string de UI hardcoded em componente ou tela; todo texto visível vem de `src/i18n/pt-BR.ts` (ou chave equivalente), mesmo o app sendo pt-BR only no MVP — isolar já evita hardcode espalhado.

## Componentes

- Funcionais + hooks, sem class components.
- Componente reutilizável mora em `src/components/<nome>/`, com o arquivo principal e teste colocados juntos (`order-card.tsx`, `order-card.test.tsx`).
- Tela não deve conter lógica de formatação/regra além de composição — extrair para hook se passar de poucas linhas.

## Reuso: componentes base, cores e variantes

Regra: **nunca duplicar estilo**. Antes de estilizar algo numa tela, verificar se já existe um componente em `src/components/ui/` que resolve; se não existir e for genérico o bastante para reaparecer em outra tela, ele nasce lá — não dentro da tela.

- **Componentes de UI base** (`src/components/ui/`): peças puramente visuais, sem regra de negócio — `Button`, `Badge`, `Card`, `Text`, `Input`, `Chip`. Não sabem o que é uma "Comanda" ou um "Item de cardápio".
- **Componentes de domínio** (`src/components/<dominio>/`): compõem os componentes base para representar um conceito do produto — `OrderCard`, `MenuItemCard`, `KitchenStatusStepper`. Podem conhecer `Order`, `MenuItem`, etc., mas não reimplementam botão/badge/cartão do zero.
- **Variante em vez de arquivo novo**: um componente com variações visuais (ex. botão primário/secundário/perigo, tamanhos) é **um único componente** com props `variant` e `size` — nunca `PrimaryButton.tsx`, `DangerButton.tsx`, `SmallButton.tsx` como componentes separados.

  ```tsx
  <Button variant="primary" size="md">Fechar conta</Button>
  <Button variant="danger" size="sm">Remover item</Button>
  <Badge variant="paid">Pago</Badge>
  <Badge variant="unpaid">A pagar</Badge>
  ```

- **Cor só via token, nunca literal**: nenhum componente ou tela usa `#E85D2C` / `"red"` inline em `style`. Toda cor referencia `src/theme/tokens.ts` (ex. `theme.colors.danger`, `theme.colors.success`) — é o que permite trocar de marca/tema sem tocar em componente (ver seção "Tema e i18n").
- Antes de introduzir uma cor nova ou um novo estilo de botão/badge/card, a pergunta é "isso já existe como variante de algo em `ui/`?" — se a resposta for "quase", estende-se a variante existente em vez de criar um componente paralelo.
- PR que adiciona um componente visual novo em `ui/` deve justificar por que uma variante de um componente existente não bastava.

## Testes

- Componentes e hooks: React Native Testing Library + Jest, arquivo `*.test.tsx`/`*.test.ts` colocado ao lado do que testa.
- Todo bug corrigido ganha teste de regressão (ver DoD em `../../.specs/05-padroes-de-codigo.md`).
