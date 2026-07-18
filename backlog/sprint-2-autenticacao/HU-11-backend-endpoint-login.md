# HU-11 · Backend: endpoint de login (username)

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Backend
**Story points:** 2

## História de usuário
Como **operador (garçom)**, quero **informar meu usuário para iniciar o acesso**, para que **o sistema saiba se devo criar um PIN pela primeira vez ou apenas digitar o PIN já cadastrado**.

## Critérios de aceite
- [ ] `POST /api/auth/login` aceita `{ "username": string }` e retorna `{ operatorId, pinSet }`.
- [ ] Se o `username` não existe, retorna 404 (`NotFoundException`) com corpo no padrão `{ statusCode, message, error }`.
- [ ] `pinSet` é `true` quando o operador já tem PIN cadastrado (`operator.pin_set = true`) e `false` no primeiro acesso.
- [ ] Entrada validada via DTO com `class-validator` (username obrigatório, string não vazia).
- [ ] Endpoint não exige `Authorization: Bearer` (é o único ponto de entrada anterior à autenticação).
- [ ] Resposta não vaza `pin_hash` nem qualquer dado sensível do operador.

## Escopo técnico
- Spec: `.specs/03-api-contrato.md` (seção Auth) e `.specs/04-fluxos.md` (4.1 Autenticação do operador).
- Módulo `AuthModule`, camada `controller` → `service` → Prisma (`operator`), conforme `.specs/05-padroes-de-codigo.md`.
- Caso o setup completo do Prisma/Postgres (HU-19, Sprint 3) ainda não exista no momento desta HU, implementar contra um repositório em memória/stub que respeite a mesma interface de serviço, para não bloquear o Sprint 2 — migrar para Prisma real ao final do Sprint 3.

## Fora de escopo
- Criação ou verificação de PIN (HU-12, HU-13).
- Política de bloqueio por tentativas (ver riscos em `.specs/00-contexto-projeto.md`).

## Dependências
- Nenhuma (primeira HU do fluxo de auth; usar stub em memória se HU-19 ainda não estiver pronta).

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (unidade do service + e2e do controller)
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
