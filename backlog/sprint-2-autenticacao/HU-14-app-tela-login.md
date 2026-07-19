# HU-14 · App: tela Login integrada à API

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **operador (garçom)**, quero **digitar meu usuário na tela de Login**, para que **o app me leve ao passo certo (criar PIN ou verificar PIN) de acordo com meu histórico de acesso**.

## Critérios de aceite
- [x] Tela `00 Login` (já existente como mock no Sprint 1) passa a chamar `POST /api/auth/login` de verdade com o `username` digitado.
- [x] Se a resposta tiver `pinSet: false`, navega para a tela `00A Criar PIN` levando o `operatorId`.
- [x] Se `pinSet: true`, navega para a tela `00B Acesso rápido por PIN` levando o `operatorId`.
- [x] Usuário inexistente (erro 404 da API) exibe mensagem de erro amigável em português, sem travar a tela.
- [x] Estado de carregamento (loading) exibido durante a chamada à API.
- [x] Nenhuma string de UI hardcoded — textos via i18n (`src/i18n/`), conforme `.specs/06-glossario.md`.

## Escopo técnico
- Spec: `.specs/03-api-contrato.md` (Auth), `.specs/04-fluxos.md` (4.1), `.specs/00-contexto-projeto.md` (tela `00`).
- Cliente REST em `src/api/` (conforme estrutura sugerida em `frontend/README.md`).
- Reaproveita a tela de Login mockada do Sprint 1 (HU-03 navegação), agora ligada à API real.

## Fora de escopo
- Lógica de criação/verificação de PIN em si (HU-15, HU-16).
- Persistência do token retornado (tratada em HU-18).

## Dependências
- HU-11 (endpoint de login deve existir).
- Sprint 1 — navegação e tela de Login mockada já implementadas.

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente/hook com React Native Testing Library)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
