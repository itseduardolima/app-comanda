# HU-47 · Comprovante digital (opcional)

**Sprint:** 6 — Produção & publicação
**Épico:** Lançamento
**Camada:** Fullstack
**Story points:** 3

## História de usuário
Como **operador (garçom)**, quero **gerar um comprovante digital da comanda fechada e enviá-lo ao cliente por WhatsApp ou e-mail**, para que **o cliente tenha um registro do pedido sem depender de impressora térmica**.

## Critérios de aceite
- [ ] Ao fechar uma comanda (`payment_status = paid`), o operador tem a opção "Gerar comprovante".
- [ ] Comprovante gerado em formato PDF ou link visualizável, contendo: itens da comanda, quantidades, modificadores relevantes, valor total, data/hora e identificação da mesa/tipo de comanda.
- [ ] Comprovante pode ser compartilhado via WhatsApp e/ou e-mail usando os mecanismos nativos de compartilhamento do dispositivo (share sheet), sem exigir integração de API paga de mensageria.
- [ ] Nenhum dado de pagamento (cartão, adquirente, id de cobrança) aparece no comprovante — apenas o registro de que a comanda foi marcada como paga.
- [ ] Geração do comprovante funciona mesmo se o dispositivo estiver momentaneamente offline (gera localmente a partir dos dados já sincronizados; envio ocorre quando houver conectividade/app de mensageria disponível).
- [ ] Texto do comprovante em português (via i18n), formatação amigável para leitura em tela de celular.

## Escopo técnico
- Referência: `PLANEJAMENTO.md` seção 5.4 (Impressão de comprovante — "alternativa mais simples: comprovante digital") e seção 7 (Fase 6, listado como opcional).
- Não depende de hardware (impressora térmica Bluetooth) — essa é uma alternativa não coberta por esta HU.

## Fora de escopo
- Impressão térmica via Bluetooth (alternativa citada na spec, não implementada nesta HU).
- Emissão fiscal / nota fiscal eletrônica — fora de escopo do MVP conforme `.specs/00-contexto-projeto.md`.
- Qualquer processamento ou registro de forma de pagamento no comprovante.

## Dependências
- Sprint 5 (Fechar conta) — a comanda precisa estar com `payment_status = paid` para gerar o comprovante final.

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
