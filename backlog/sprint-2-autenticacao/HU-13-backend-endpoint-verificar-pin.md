# HU-13 · Backend: endpoint verificar PIN

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Backend
**Story points:** 3

## História de usuário
Como **operador (garçom) que já tem PIN cadastrado**, quero **digitar meu PIN de 4 dígitos**, para que **eu entre no app rapidamente nos acessos seguintes, sem redigitar meu usuário**.

## Critérios de aceite
- [x] `POST /api/auth/pin/verify` aceita `{ operatorId, pin }` e retorna `{ accessToken, operator: { id, name } }`.
- [x] PIN incorreto retorna 401 (`UnauthorizedException`) sem indicar se o erro foi no `operatorId` ou no `pin` (evitar enumeração de usuários).
- [x] Comparação do PIN é feita contra o hash armazenado (nunca comparação em texto plano).
- [x] `accessToken` retornado é um JWT válido, mesma estrutura/segredo usado por `pin/create` (HU-12).
- [x] Endpoint não exige `Authorization: Bearer` (ocorre antes da sessão existir).
- [x] Comportamento documentado (comentário/README) de que a **política de bloqueio após N tentativas** ainda não está implementada nesta HU — é ponto em aberto registrado em `.specs/00-contexto-projeto.md`, a ser tratado em iteração futura de segurança.

## Escopo técnico
- Spec: `.specs/03-api-contrato.md` (seção Auth), `.specs/04-fluxos.md` (4.1).
- Módulo `AuthModule`, mesmo fluxo de emissão de JWT de HU-12.
- Mesma nota de HU-11 sobre stub em memória caso Prisma/Postgres (HU-19) ainda não exista.

## Fora de escopo
- Bloqueio por tentativas incorretas (ponto em aberto, não bloqueante para esta HU).
- Redefinição de PIN esquecido.

## Dependências
- HU-11 (precisa do `operatorId`), HU-12 (precisa de um PIN já criado para haver o que verificar).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando (unidade do service + e2e do controller, incluindo caso de PIN incorreto)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
