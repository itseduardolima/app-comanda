# HU-43 · Configurar EAS Build (iOS + Android)

**Sprint:** 6 — Produção & publicação
**Épico:** Lançamento
**Camada:** Ops
**Story points:** 3

## História de usuário
Como **responsável técnico pelo projeto**, quero **um pipeline de build configurado via EAS (Expo Application Services)**, para que **o mesmo código-fonte gere pacotes instaláveis de iOS e Android, com atualizações OTA para correções sem precisar republicar nas lojas**.

## Critérios de aceite
- [ ] `eas.json` configurado com pelo menos 3 perfis de build: `development` (com dev client, para testes internos), `preview` (build interno para distribuição ad-hoc/TestFlight interno) e `production` (build final de loja).
- [ ] `eas build --platform android --profile production` gera um `.aab` válido e instalável.
- [ ] `eas build --platform ios --profile production` gera um `.ipa` válido, assinado com as credenciais corretas (certificado de distribuição + provisioning profile gerenciados pelo EAS ou importados).
- [ ] Variáveis de ambiente/segredos de produção (ex. `API_URL` do backend) configurados via EAS Secrets, não hardcoded no repositório.
- [ ] Canal de atualização OTA (`eas update`) configurado e testado: uma alteração de JS publicada via `eas update` chega a um build `production` já instalado, sem passar pela loja.
- [ ] Documentação do processo de build/release registrada no `README.md` do `frontend/`.

## Escopo técnico
- Referência: `PLANEJAMENTO.md` seções 4.1, 5.5 (Infraestrutura) e 7 (Fase 6); `frontend/README.md` (seção Setup, "Build de loja").
- Ferramenta: EAS Build + EAS Update (Expo Application Services).
- Não inclui a submissão/revisão nas lojas em si (ver HU-44 e HU-45).

## Fora de escopo
- Submissão e aprovação nas lojas (App Store / Play Store) — tratado em HU-44 e HU-45.
- Qualquer lógica de pagamento ou cobrança dentro do app.

## Dependências
- MVP funcional completo (Sprints 1–5) — não há o que empacotar em produção antes disso.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
