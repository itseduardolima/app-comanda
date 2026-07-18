# HU-01 · Setup do projeto Expo + TypeScript

**Sprint:** 1 — Scaffold do app
**Épico:** Fundação do App
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **desenvolvedor**, quero **um projeto React Native + Expo em TypeScript com a estrutura de pastas definida**, para que **as próximas HUs de telas e navegação tenham uma base consistente para trabalhar**.

## Critérios de aceite
- [ ] Projeto criado com Expo (TypeScript template), rodando em `npx expo start` sem erros.
- [ ] `tsconfig.json` com `strict: true`.
- [ ] Estrutura de pastas criada conforme `frontend/README.md`: `app/` (rotas Expo Router), `src/api/`, `src/ws/`, `src/store/`, `src/db/`, `src/i18n/`, `src/theme/`, `src/components/`.
- [ ] Lint (ESLint) e formatação (Prettier) configurados e rodando sem erros no projeto vazio.
- [ ] App abre no simulador iOS e no emulador/dispositivo Android a partir do mesmo código-fonte.
- [ ] README do frontend atualizado com instruções reais de setup (substituindo o placeholder "a preencher no scaffold").

## Escopo técnico
- Referência: `frontend/README.md` (tecnologias e estrutura sugerida), `.specs/05-padroes-de-codigo.md` (TypeScript strict, componentes funcionais + hooks).
- Não inclui navegação (ver HU-03) nem tema (ver HU-02) — apenas o esqueleto do projeto.

## Fora de escopo
- Configuração de tema/cores (HU-02).
- Rotas e navegação (HU-03).
- Qualquer integração com backend.

## Dependências
- Nenhuma.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
