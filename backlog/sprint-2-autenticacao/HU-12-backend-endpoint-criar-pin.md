# HU-12 · Backend: endpoint criar PIN (1º acesso)

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Backend
**Story points:** 3

## História de usuário
Como **operador (garçom) acessando pela primeira vez**, quero **definir um PIN de 4 dígitos**, para que **eu possa entrar rapidamente no app nos próximos acessos sem digitar usuário toda vez**.

## Critérios de aceite
- [x] `POST /api/auth/pin/create` aceita `{ operatorId, pin }` e retorna `{ accessToken, operator: { id, name } }`.
- [x] Rejeita PIN que não tenha exatamente 4 dígitos numéricos (validação via DTO com `class-validator`).
- [x] Se `operator.pin_set` já for `true`, retorna 409/400 (não permite recriar PIN por esta rota).
- [x] PIN é armazenado como **hash** (`pin_hash`), nunca em texto plano — usar bcrypt ou equivalente.
- [x] Após sucesso, `operator.pin_set` passa a `true`.
- [x] `accessToken` retornado é um JWT assinado (`JWT_SECRET`), contendo ao menos o `operatorId`.
- [x] Endpoint não exige `Authorization: Bearer` (ocorre antes da sessão existir).

## Escopo técnico
- Spec: `.specs/03-api-contrato.md` (seção Auth), `.specs/04-fluxos.md` (4.1), `.specs/02-modelo-de-dados.md` (`operator.pin_hash`, `operator.pin_set`).
- Módulo `AuthModule`, uso de `@nestjs/passport` + JWT para emissão do token (conforme `.specs/01-arquitetura.md`).
- Mesma nota de HU-11 sobre stub em memória caso Prisma/Postgres (HU-19) ainda não exista.

## Fora de escopo
- Fluxo de "esqueci o PIN" / redefinição (não mapeado nos specs atuais).
- Política de bloqueio por tentativas (ponto em aberto, ver riscos).

## Dependências
- HU-11 (precisa do `operatorId` retornado pelo login).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando (unidade do service + e2e do controller)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
