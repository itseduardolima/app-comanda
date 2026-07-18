# 01 · Arquitetura

## Visão geral

```
┌──────────────────────────┐         REST / JSON          ┌──────────────────────────┐
│   App do Garçom          │  ─────────────────────────▶  │   Backend (NestJS)       │
│   React Native + Expo    │        JWT no header          │   Node.js + TypeScript   │
│   TypeScript             │  ◀─────────────────────────  │                          │
│                          │                               │  AuthModule              │
│  - Expo Router (nav)     │   WebSocket (tempo real):     │  OrdersModule            │
│  - Zustand (estado)      │   status de cozinha e         │  MenuModule              │
│  - expo-sqlite (offline) │   comandas empurrados         │  TablesModule            │
│  - WS client             │  ◀════════════════════════   │  KitchenModule           │
│                          │                               │  KitchenGateway (WS)     │
                                                            └────────────┬─────────────┘
                                                                         │ Prisma
                                                                         ▼
                                                              ┌──────────────────────┐
                                                              │   PostgreSQL         │
                                                              └──────────────────────┘
```

## Componentes

### Frontend — `frontend/`
- **React Native + Expo** em **TypeScript**. Um único código para iOS e Android.
- **Navegação**: Expo Router (ou React Navigation) — stack de auth (Login/PIN) + tabs (Comandas/Cardápio/Vendas/Perfil) + telas de detalhe.
- **Estado**: Zustand (simples) ou Redux Toolkit.
- **Offline-first**: persistência local com `expo-sqlite`; fila de sincronização para rede instável de salão.
- **Build/distribuição**: EAS (Expo Application Services).

### Backend — `backend/`
- **NestJS** (Node.js + TypeScript) — arquitetura modular (módulos, controllers, services, DI).
- **ORM**: **Prisma** sobre PostgreSQL (schema em `prisma/schema.prisma`, migrations versionadas).
- **Auth**: `@nestjs/passport` + JWT (usuário + PIN → token).
- **Validação**: `class-validator` / `class-transformer` nos DTOs.
- **Tempo real**: **WebSocket** via `@nestjs/websockets` (Gateway) para status de cozinha e atualização de comandas. REST cobre o CRUD; o WS empurra eventos.
- Monolito simples — **sem** Kubernetes/microsserviços.

### Banco — PostgreSQL
- Modelo relacional simples (ver `02-modelo-de-dados.md`). Sem Redis/cache no MVP.

## Módulos do backend

| Módulo | Responsabilidade |
|---|---|
| `AuthModule` | Autenticação do operador (usuário + PIN, emissão de JWT) |
| `OrdersModule` | CRUD de comandas (orders) e itens; `closeOrder` (marca pago) |
| `MenuModule` | Itens e categorias do cardápio |
| `TablesModule` | Mesas e status (`free` / `occupied`) |
| `KitchenModule` | Tickets e status por item (`queued → preparing → ready → delivered`); inclui `KitchenGateway` (WebSocket) que difunde eventos de mudança |

## Comunicação de status de cozinha (tempo real)

**WebSocket** é o mecanismo de tempo real. O backend expõe um **Gateway** (`@nestjs/websockets`) que empurra eventos quando o status de um item ou de uma comanda muda; o app se inscreve e atualiza a tela sem re-consultar.

- Transporte: **Socket.IO** (adaptador padrão do `@nestjs/websockets`). Escolhido por já entregar o que a rede de salão instável exige — **reconexão automática**, heartbeat/ping-pong, **rooms** e cliente React Native maduro (`socket.io-client`); o `ws` puro exigiria reimplementar tudo isso à mão. Backend: `@WebSocketGateway()`. Cliente: `socket.io-client`.
- Autenticação do socket: mesmo **JWT** do REST, enviado no handshake.
- **Fallback**: em rede de restaurante instável, o cliente reconecta automaticamente e, ao reconectar, faz um `GET` REST para ressincronizar o estado (o WS entrega o delta; o REST garante o baseline). Assim o app nunca fica preso a um socket morto.
- Serve tanto o app do garçom quanto um eventual display de cozinha (KDS).

## Infraestrutura

- Backend em **Railway, Render ou Fly.io** (deploy simples, baixo custo) ou VPS básica.
- App distribuído via **EAS Build** (pacotes iOS + Android; OTA para correções sem republicar).
