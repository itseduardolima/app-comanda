# HU-02 · Tema e identidade visual configurável

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **desenvolvedor**, quero **cores, tipografia, nome e logo isolados em uma camada de tema configurável (`src/theme/`)**, para que **o app sirva a qualquer restaurante trocando apenas a configuração, sem alterar código** (o produto é genérico; "Fogo & Brasa" é só o tema de exemplo do protótipo).

## Critérios de aceite
- [x] `src/theme/` expõe um objeto de tema (cores, tipografia, espaçamentos) consumido pelos componentes via hook/contexto (ex.: `useTheme()`), nunca hardcoded em cada tela.
- [x] Nome do estabelecimento e logo são configuráveis (constante/arquivo de config), não fixos como "Fogo & Brasa" no código.
- [x] Um tema de exemplo baseado no protótipo `App Garcom Fogo e Brasa.dc.html` é criado como valor padrão/demonstração.
- [x] Trocar os valores do tema (ex.: cor primária) reflete em todas as telas já existentes sem editar componentes individuais.
- [x] Suporte básico a modo claro/escuro OU justificativa documentada de que só um modo é suportado no MVP.

## Escopo técnico
- Referência: `frontend/README.md` (`src/theme/` — cores e tipografia do protótipo, tema/marca configurável), `.specs/00-contexto-projeto.md` (produto genérico, marca como configuração).

## Fora de escopo
- Editor visual de tema dentro do app (fica como configuração estática/build-time no MVP).
- Multi-tenant (vários temas simultâneos em runtime).

## Dependências
- HU-01

## Definition of Done
- [x] Código em inglês, UI via i18n
- [x] Tipos (`tsc`) e lint OK
- [x] Testes relevantes passando
- [x] Spec em `.specs/` atualizada, se o comportamento mudou
- [x] Nenhuma lógica de pagamento/cobrança introduzida
