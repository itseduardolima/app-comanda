# HU-46 · Piloto no restaurante real (testes de campo)

**Sprint:** 6 — Produção & publicação
**Épico:** Lançamento
**Camada:** Fullstack
**Story points:** 5

## História de usuário
Como **gestor do produto**, quero **rodar um piloto do app com garçons de verdade em um restaurante real**, para que **o fluxo completo (login → comanda → cozinha → fechar conta) seja validado em condições reais de rede de salão antes do lançamento amplo**.

## Critérios de aceite
- [ ] Piloto executado com pelo menos 1 restaurante real e operadores reais, por um período mínimo definido (ex.: 1 semana de uso contínuo em horário de pico).
- [ ] Fluxo completo exercitado em produção/staging: login por PIN → abrir comanda (mesa/balcão/delivery) → anotar pedido → enviar à cozinha → acompanhar status por item em tempo real → fechar conta.
- [ ] Comportamento sob rede instável de salão observado e registrado: reconexão de WebSocket, ressincronização via REST, funcionamento do modo offline-first (HU-28).
- [ ] Lista de bugs e pontos de atrito coletada e priorizada (bug tracker ou planilha), com severidade classificada.
- [ ] Feedback qualitativo dos operadores coletado (o que travou, o que confundiu, o que faltou).
- [ ] Critério de saída do piloto definido e comunicado (ex.: zero bugs críticos abertos) antes de liberar para uso amplo.

## Escopo técnico
- Referência: `PLANEJAMENTO.md` seção 7 (Fase 6) e seção 8 (Riscos — sincronização offline, segurança do PIN, fechar conta como registro manual).
- Cobre validação end-to-end de todas as specs funcionais (`.specs/04-fluxos.md`).

## Fora de escopo
- Correção dos bugs encontrados (vira backlog de sprints de estabilização subsequentes, fora deste backlog inicial).
- Qualquer processamento de pagamento real — o piloto usa os métodos de pagamento por fora do app (maquininha avulsa, Pix, dinheiro), como já é o desenho do produto.

## Dependências
- HU-44 e/ou HU-45 (build publicado em ao menos uma loja) — ou, alternativamente, um build `preview`/`development` via EAS (HU-43) distribuído diretamente aos operadores caso a publicação nas lojas ainda não tenha saído.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
