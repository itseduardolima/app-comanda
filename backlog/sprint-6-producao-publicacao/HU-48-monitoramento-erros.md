# HU-48 · Monitoramento de erros (crash/log reporting)

**Sprint:** 6 — Produção & publicação
**Épico:** Lançamento
**Camada:** Backend/Frontend
**Story points:** 3

## História de usuário
Como **responsável técnico pelo projeto**, quero **monitoramento de erros e crashes em produção, tanto no app quanto no backend**, para que **problemas em uso real sejam detectados e diagnosticados rapidamente após o lançamento**.

## Critérios de aceite
- [ ] Ferramenta de crash/error reporting (ex.: Sentry) integrada no app React Native, capturando exceções não tratadas e crashes nativos, com stack trace e contexto (tela, operador, ação).
- [ ] Mesma ferramenta (ou equivalente) integrada no backend NestJS, capturando exceções não tratadas dos controllers/services e falhas de conexão com o banco.
- [ ] Erros do WebSocket Gateway (falhas de conexão, desconexões inesperadas) também instrumentados, dado o requisito de robustez em rede instável.
- [ ] Alertas configurados para erros críticos (ex.: notificação por e-mail/Slack quando a taxa de erro ultrapassa um limiar).
- [ ] Dados sensíveis (PIN, token JWT) explicitamente excluídos dos logs e relatórios de erro.
- [ ] Dashboard de monitoramento acessível ao responsável técnico, com histórico mínimo de 30 dias.

## Escopo técnico
- Referência: `PLANEJAMENTO.md` seção 7 (Fase 6 — "monitoramento de erros") e `.specs/01-arquitetura.md` (componentes app/backend/WebSocket).
- Cobre tanto o cliente (React Native + Expo) quanto o servidor (NestJS) e o canal de tempo real (Socket.IO Gateway).

## Fora de escopo
- Monitoramento de métricas de negócio (ex.: dashboards de vendas) — não faz parte desta HU, que é estritamente sobre erros técnicos.
- Qualquer captura de dado de pagamento (inexistente no produto).

## Dependências
- HU-43 (build de produção deve existir para monitorar o app em produção)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
