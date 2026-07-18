# HU-45 · Publicação na Play Store

**Sprint:** 6 — Produção & publicação
**Épico:** Lançamento
**Camada:** Ops
**Story points:** 2

## História de usuário
Como **responsável pelo lançamento do produto**, quero **o app publicado na Google Play Store**, para que **usuários Android possam instalar o app do garçom pela loja oficial**.

## Critérios de aceite
- [ ] Conta Google Play Console (desenvolvedor) criada/ativa.
- [ ] Ficha da loja preenchida: nome, descrição curta/longa, ícone, screenshots, categoria (Negócios/Produtividade).
- [ ] Política de privacidade publicada e vinculada na ficha da loja.
- [ ] Build de produção (`.aab`) gerado via EAS (HU-43) enviado por `eas submit --platform android` ou upload manual no Play Console.
- [ ] App passa pela revisão do Google e fica disponível (ao menos em faixa de teste interno/fechado antes de produção total).
- [ ] Processo documentado (passo a passo) para futuras publicações de novas versões.

## Escopo técnico
- Referência: `PLANEJAMENTO.md` seção 8 (Riscos — "Publicação nas duas lojas": Android é descrito como processo mais simples que iOS).
- Recomenda-se testar primeiro em faixa de "teste interno" do Play Console antes de produção total.

## Fora de escopo
- Geração do build em si (ver HU-43).
- Qualquer funcionalidade de cobrança in-app (Google Play Billing) — não existe no produto.

## Dependências
- HU-43 (build de produção via EAS deve existir antes da submissão)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
