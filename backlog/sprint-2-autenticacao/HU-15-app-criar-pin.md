# HU-15 · App: Criar PIN (1º acesso)

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **operador (garçom) no meu primeiro acesso**, quero **definir e confirmar um PIN de 4 dígitos**, para que **eu possa usar esse PIN para entrar rapidamente nos próximos acessos**.

## Critérios de aceite
- [x] Tela `00A Criar PIN` (mock do Sprint 1) permite digitar um PIN de 4 dígitos e depois confirmá-lo digitando novamente.
- [x] Se a confirmação não bater com o PIN original, exibe erro e permite tentar novamente sem sair da tela.
- [x] Ao confirmar com sucesso, chama `POST /api/auth/pin/create` com `{ operatorId, pin }`.
- [x] Resposta com `accessToken` é entregue para a camada de sessão (HU-18) e o operador é redirecionado para a tela `01 Comandas`.
- [x] Erro da API (ex.: PIN já existente) exibe mensagem amigável em português via i18n.
- [x] Teclado numérico exibido é adequado para entrada de PIN (não teclado alfabético completo).

## Escopo técnico
- Spec: `.specs/03-api-contrato.md` (Auth), `.specs/04-fluxos.md` (4.1), `.specs/00-contexto-projeto.md` (tela `00A`).
- Reaproveita a tela mockada do Sprint 1; troca dados fake pela chamada real ao endpoint de HU-12.

## Fora de escopo
- Verificação de PIN em acessos subsequentes (HU-16).
- Regras de força/política do PIN além do formato de 4 dígitos (ponto em aberto, ver riscos).

## Dependências
- HU-12 (endpoint de criação de PIN).
- HU-14 (tela de Login deve entregar o `operatorId` para esta tela).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente/hook com React Native Testing Library)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
