# HU-60 · Backend: acesso do dispositivo de cozinha ao KDS

**Sprint:** 8 — KDS e escala
**Épico:** Display de Cozinha (KDS)
**Camada:** Backend
**Story points:** 5

## História de usuário
Como **dono do restaurante**, quero **que o tablet fixo da cozinha acesse o KDS como um dispositivo da casa, sem ninguém logar como garçom**, para que **a fila de tickets fique na parede o serviço inteiro sem depender de alguém manter uma sessão pessoal aberta**.

## Critérios de aceite
- [ ] Nova entidade `KitchenDevice` no `prisma/schema.prisma`: `id`, `name` (ex.: "Cozinha quente"), `pairingCodeHash`, `tokenVersion`, `revokedAt`, `lastSeenAt`, `createdAt` — com migration versionada.
- [ ] Pareamento por **código de uso único** gerado fora do app (seed/CLI administrativa): `POST /api/kitchen/devices/pair` recebe `{ pairingCode }`, é `@Public()`, e devolve `{ device: { id, name }, token }`. O código é consumido no primeiro uso e não serve duas vezes.
- [ ] O token do dispositivo é um **JWT de escopo próprio** (`sub = device:<id>`, claim `role = kitchen_device`) com validade longa (ex.: 90 dias) e renovação silenciosa — **não** existe login por usuário+senha, e o dispositivo **não** é um `Operator`.
- [ ] O escopo `kitchen_device` autoriza **somente** as rotas do KDS: `GET /api/kitchen/tickets` (fila) e `PATCH /api/kitchen/items/:itemId` (avanço de status). Qualquer outra rota autenticada responde **403** para esse token — em especial criar comanda, adicionar item, fechar conta e qualquer rota de `orders` de escrita.
- [ ] O `JwtAuthGuard`/`WsJwtGuard` distinguem os dois tipos de sujeito; `@CurrentOperator()` continua devolvendo operador e **nunca** um dispositivo (rota que exige operador rejeita token de dispositivo).
- [ ] Revogação: marcar `revokedAt` ou incrementar `tokenVersion` invalida imediatamente o token do tablet, inclusive a conexão WebSocket aberta (o socket é derrubado no próximo evento/heartbeat).
- [ ] Ações de cozinha feitas pelo tablet são atribuídas ao **dispositivo**, não a um operador — a auditoria registra `kitchen_device_id`, e `closed_by_id`/`operator_id` de comanda seguem intocados.
- [ ] `.specs/03-api-contrato.md` e `.specs/02-modelo-de-dados.md` atualizados no mesmo commit — **isto é mudança de contrato**: rota nova, entidade nova e um segundo tipo de sujeito autenticado.
- [ ] Testes cobrem: pareamento válido, código já usado → 400/409, token de dispositivo em rota de garçom → 403, token de operador continuando a funcionar no KDS, e revogação invalidando o token.
- [ ] Nenhuma credencial vaza: `pairingCodeHash` nunca é devolvido, e erro de pareamento é genérico.

## Escopo técnico
- Autenticação hoje é operador com `username` + PIN (`backend/src/auth/`). O tablet fixo é um caso diferente — **dispositivo compartilhado, sem garçom logado**; por isso o pareamento por código, não uma conta de operador "cozinha".
- Reaproveitar o `WsJwtGuard` existente (`backend/src/kitchen/kitchen.gateway.ts` valida JWT no handshake) para aceitar também o sujeito dispositivo.
- Referências: `PROXIMOS-PASSOS.md` § "A cozinha não tem tela"; moldura 6A (tablet fixo na parede, leitura a 2 m).

## Fora de escopo
- Tela de administração de dispositivos (o pareamento é gerado por CLI/seed neste sprint).
- Múltiplas estações de cozinha com roteamento de item por categoria (quente/frio/bar) — um único KDS por enquanto.
- Rate limit e lockout das rotas públicas (item separado de segurança).

## Dependências
- HU-31 (gateway WebSocket da cozinha), HU-30 (atualizar status do item)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
