# HU-18 · App: persistência de sessão (JWT) e rotas protegidas

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **operador (garçom)**, quero **continuar logado ao reabrir o app**, para que **eu não precise digitar usuário e PIN toda vez que sair e voltar ao app durante o turno**.

## Critérios de aceite
- [x] O `accessToken` (JWT) retornado por `pin/create` ou `pin/verify` é persistido em armazenamento seguro do dispositivo (ex.: `expo-secure-store`), não em `AsyncStorage` puro.
- [x] Ao abrir o app, se houver token válido persistido, o operador vai direto para `01 Comandas`, sem passar por Login/PIN.
- [x] Toda chamada REST autenticada anexa o header `Authorization: Bearer <jwt>` automaticamente (interceptor único no cliente `src/api/`).
- [x] O handshake do cliente WebSocket usa o **mesmo JWT** (conforme `.specs/01-arquitetura.md` e `.specs/03-api-contrato.md`), sem exigir novo login.
- [x] Telas fora do stack de autenticação (`(tabs)` e rotas de detalhe) são protegidas: sem token válido, o app redireciona para `00 Login` antes de renderizar qualquer dado.
- [x] Resposta 401 de qualquer chamada REST limpa a sessão local e redireciona para `00 Login`.

## Escopo técnico
- Spec: `.specs/01-arquitetura.md` (comunicação JWT no REST e no handshake WS), `.specs/03-api-contrato.md`.
- Estrutura sugerida em `frontend/README.md`: `src/api/` (cliente REST), `src/ws/` (cliente WebSocket), `src/store/` (Zustand).

## Fora de escopo
- Refresh token / renovação automática de JWT expirado (não mapeado nos specs atuais; se necessário, tratar como HU futura).
- Conexão WebSocket em si (implementada no Sprint 4, HU-32) — aqui só garante que o JWT estará disponível para ela.

## Dependências
- HU-15 e HU-16 (telas que geram o `accessToken` inicial).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente/hook com React Native Testing Library, incluindo cenário de token expirado/401)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
