# HU-16 · App: Acesso rápido por PIN

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **operador (garçom) que já tem PIN cadastrado**, quero **digitar apenas meu PIN de 4 dígitos**, para que **eu entre no app rapidamente sem repetir meu usuário toda vez**.

## Critérios de aceite
- [x] Tela `00B Acesso rápido por PIN` (mock do Sprint 1) permite digitar o PIN de 4 dígitos.
- [x] Ao completar os 4 dígitos, chama `POST /api/auth/pin/verify` com `{ operatorId, pin }` automaticamente (sem precisar de botão extra "Confirmar").
- [x] PIN incorreto exibe erro em português e limpa o campo para nova tentativa, sem navegar para outra tela.
- [x] Sucesso entrega `accessToken` para a camada de sessão (HU-18) e redireciona para a tela `01 Comandas`.
- [x] Teclado numérico exibido é adequado para entrada de PIN.

## Escopo técnico
- Spec: `.specs/03-api-contrato.md` (Auth), `.specs/04-fluxos.md` (4.1), `.specs/00-contexto-projeto.md` (tela `00B`).
- Reaproveita a tela mockada do Sprint 1; troca dados fake pela chamada real ao endpoint de HU-13.

## Fora de escopo
- Opção "Trocar" usuário (HU-17).
- Bloqueio após N tentativas incorretas (ponto em aberto, ver `.specs/00-contexto-projeto.md`).

## Dependências
- HU-13 (endpoint de verificação de PIN).
- HU-14 (tela de Login deve entregar o `operatorId` para esta tela, quando aplicável).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente/hook com React Native Testing Library, incluindo caso de PIN incorreto)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
