# HU-17 · App: Trocar usuário / logout

**Sprint:** 2 — Autenticação
**Épico:** Autenticação
**Camada:** Frontend
**Story points:** 2

## História de usuário
Como **operador (garçom) usando um dispositivo compartilhado**, quero **trocar de usuário ou sair da minha sessão**, para que **outro garçom possa usar o mesmo aparelho com sua própria conta, sem ver minhas comandas**.

## Critérios de aceite
- [x] Tela `00B Acesso rápido por PIN` exibe uma opção "Trocar" usuário que leva de volta à tela `00 Login`.
- [ ] Ao trocar de usuário, qualquer PIN parcialmente digitado é descartado e nenhum dado do operador anterior fica visível na tela de Login.
- [x] Existe uma ação de logout acessível a partir da tela `Perfil` (tab bar) que limpa a sessão ativa (token e dados do operador) e retorna à tela `00 Login`.
- [x] Após logout, tentar acessar qualquer tela autenticada redireciona para `00 Login` (nenhuma tela protegida some visível "por trás").

## Escopo técnico
- Spec: `.specs/04-fluxos.md` (4.1), `.specs/00-contexto-projeto.md` (tela `00B`, tab `Perfil`).
- Usa a camada de sessão/persistência de token (HU-18) para saber o que limpar ao trocar/deslogar.

## Fora de escopo
- Múltiplas sessões simultâneas no mesmo dispositivo (fora do escopo do MVP).

## Dependências
- HU-16 (tela de acesso rápido por PIN, onde vive a opção "Trocar").
- HU-18 (mecanismo de sessão/JWT a ser limpo).

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando (componente/hook com React Native Testing Library)
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
