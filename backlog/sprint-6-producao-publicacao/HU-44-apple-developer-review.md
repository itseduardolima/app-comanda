# HU-44 · Conta Apple Developer + processo de revisão

**Sprint:** 6 — Produção & publicação
**Épico:** Lançamento
**Camada:** Ops
**Story points:** 2

## História de usuário
Como **responsável pelo lançamento do produto**, quero **uma conta Apple Developer ativa e o app submetido ao processo de revisão da App Store**, para que **o app do garçom possa ser publicado e instalado por usuários iOS**.

## Critérios de aceite
- [ ] Conta Apple Developer Program contratada (US$ 99/ano) em nome da empresa/produto responsável.
- [ ] App criado no App Store Connect com bundle identifier, nome, categoria e ficha da loja (descrição, ícone, screenshots dos principais fluxos: login, comandas, cardápio, cozinha).
- [ ] Política de privacidade publicada e vinculada (obrigatória para submissão), coerente com os dados tratados (login de operador, comandas — sem dados de pagamento, já que está fora de escopo).
- [ ] Build `production` gerado via EAS (HU-43) submetido pelo App Store Connect / `eas submit --platform ios`.
- [ ] Build aprovado na revisão da Apple ou, em caso de rejeição, motivo documentado e reenviado com correção.
- [ ] Processo documentado (passo a passo) para futuras submissões de novas versões.

## Escopo técnico
- Referência: `PLANEJAMENTO.md` seção 8 (Riscos — "Publicação nas duas lojas") e `.specs/00-contexto-projeto.md` (riscos).
- Apple exige revisão mais rígida que a Play Store — reservar tempo de buffer no cronograma para possíveis rejeições e resubmissões.

## Fora de escopo
- Geração do build em si (ver HU-43).
- Qualquer funcionalidade de pagamento in-app (que acionaria exigências adicionais da Apple sobre In-App Purchase) — não existe no produto.

## Dependências
- HU-43 (build de produção via EAS deve existir antes da submissão)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
