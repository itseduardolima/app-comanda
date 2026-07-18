# Backlog · App do Garçom

> Backlog de produto organizado em **Histórias de Usuário (HU)**, separadas por **sprints**, seguindo Scrum.
> Cada HU vive em um arquivo `.md` próprio dentro da pasta do seu sprint.
> Base: [`../PLANEJAMENTO.md`](../PLANEJAMENTO.md) (roadmap de fases) e [`../.specs/`](../.specs/) (contrato técnico — fonte da verdade de comportamento).
>
> **Convenção de numeração**: HUs numeradas sequencialmente `HU-01` a `HU-48`, únicas em todo o backlog (não reiniciam por sprint).
> **Estimativa**: story points em escala Fibonacci (1, 2, 3, 5, 8).
> **Idioma**: HUs escritas em português (artefato de produto/negócio); código e specs técnicas seguem a convenção do repo (código em inglês — ver `.specs/05-padroes-de-codigo.md`).

## Sprints

| Sprint | Objetivo (Sprint Goal) | Fase correspondente |
|---|---|---|
| [Sprint 1 — Scaffold do app](sprint-1-scaffold-app/) | App React Native navegável nas duas plataformas, com todas as telas e dados mockados, tema aplicado. Sem backend ainda. | Fase 1 |
| [Sprint 2 — Autenticação](sprint-2-autenticacao/) | Operador loga de verdade (usuário + PIN) contra o backend, com JWT persistido no app. | Fase 2 |
| [Sprint 3 — Backend & persistência](sprint-3-backend-persistencia/) | Mocks substituídos por API real (NestJS + Postgres); app funciona offline-first. | Fase 3 |
| [Sprint 4 — Cozinha em tempo real](sprint-4-cozinha-tempo-real/) | Status de cozinha por item atualiza via WebSocket, com reconexão resiliente. | Fase 4 |
| [Sprint 5 — Fechar conta](sprint-5-fechar-conta/) | Operador fecha a conta (marca paga), mesa libera, comanda migra para aba Pagas. | Fase 5 |
| [Sprint 6 — Produção & publicação](sprint-6-producao-publicacao/) | App publicado nas duas lojas, testado em campo, com monitoramento de erros. | Fase 6 |

> Fase 0 (validação de UX / protótipo) já está concluída — não gera HUs.

## Índice de HUs

### Sprint 1 — Scaffold do app (Frontend)
| HU | Título | Pontos |
|---|---|---|
| [HU-01](sprint-1-scaffold-app/HU-01-setup-projeto-expo.md) | Setup do projeto Expo + TypeScript | 3 |
| [HU-02](sprint-1-scaffold-app/HU-02-tema-identidade-visual.md) | Tema e identidade visual configurável | 3 |
| [HU-03](sprint-1-scaffold-app/HU-03-navegacao-app.md) | Navegação (stack auth + tabs + rotas de detalhe) | 5 |
| [HU-04](sprint-1-scaffold-app/HU-04-tela-comandas-mock.md) | Tela Comandas (lista mockada, filtros) | 3 |
| [HU-05](sprint-1-scaffold-app/HU-05-tela-nova-comanda-mock.md) | Tela Nova comanda | 2 |
| [HU-06](sprint-1-scaffold-app/HU-06-tela-escolher-mesa-mock.md) | Tela Escolher mesa | 2 |
| [HU-07](sprint-1-scaffold-app/HU-07-tela-cardapio-mock.md) | Tela Cardápio | 3 |
| [HU-08](sprint-1-scaffold-app/HU-08-tela-personalizar-item-mock.md) | Tela Personalizar item | 3 |
| [HU-09](sprint-1-scaffold-app/HU-09-tela-detalhe-comanda-mock.md) | Tela Detalhe da comanda | 5 |
| [HU-10](sprint-1-scaffold-app/HU-10-telas-status-cozinha-mock.md) | Telas de status de cozinha (mock) | 5 |

### Sprint 2 — Autenticação
| HU | Título | Camada | Pontos |
|---|---|---|---|
| [HU-11](sprint-2-autenticacao/HU-11-backend-endpoint-login.md) | Backend: endpoint de login (username) | Backend | 2 |
| [HU-12](sprint-2-autenticacao/HU-12-backend-endpoint-criar-pin.md) | Backend: endpoint criar PIN (1º acesso) | Backend | 3 |
| [HU-13](sprint-2-autenticacao/HU-13-backend-endpoint-verificar-pin.md) | Backend: endpoint verificar PIN | Backend | 3 |
| [HU-14](sprint-2-autenticacao/HU-14-app-tela-login.md) | App: tela Login integrada à API | Frontend | 3 |
| [HU-15](sprint-2-autenticacao/HU-15-app-criar-pin.md) | App: Criar PIN (1º acesso) | Frontend | 3 |
| [HU-16](sprint-2-autenticacao/HU-16-app-acesso-rapido-pin.md) | App: Acesso rápido por PIN | Frontend | 2 |
| [HU-17](sprint-2-autenticacao/HU-17-app-trocar-usuario-logout.md) | App: Trocar usuário / logout | Frontend | 2 |
| [HU-18](sprint-2-autenticacao/HU-18-app-persistencia-sessao-jwt.md) | App: persistência de sessão (JWT) e rotas protegidas | Frontend | 3 |

### Sprint 3 — Backend & persistência
| HU | Título | Camada | Pontos |
|---|---|---|---|
| [HU-19](sprint-3-backend-persistencia/HU-19-backend-setup-nestjs-prisma.md) | Backend: setup NestJS + Prisma + Postgres | Backend | 5 |
| [HU-20](sprint-3-backend-persistencia/HU-20-backend-modulo-menu.md) | Backend: módulo Menu | Backend | 3 |
| [HU-21](sprint-3-backend-persistencia/HU-21-backend-modulo-tables.md) | Backend: módulo Tables | Backend | 3 |
| [HU-22](sprint-3-backend-persistencia/HU-22-backend-orders-criar-comanda.md) | Backend: Orders — criar comanda | Backend | 3 |
| [HU-23](sprint-3-backend-persistencia/HU-23-backend-orders-listar-comandas.md) | Backend: Orders — listar com filtro | Backend | 2 |
| [HU-24](sprint-3-backend-persistencia/HU-24-backend-orders-detalhe-comanda.md) | Backend: Orders — detalhe da comanda | Backend | 2 |
| [HU-25](sprint-3-backend-persistencia/HU-25-backend-orders-itens.md) | Backend: Orders — itens (adicionar/editar/remover) | Backend | 5 |
| [HU-26](sprint-3-backend-persistencia/HU-26-app-integrar-cardapio-api.md) | App: integrar Cardápio com API real | Frontend | 3 |
| [HU-27](sprint-3-backend-persistencia/HU-27-app-integrar-comandas-api.md) | App: integrar Nova comanda/Escolher mesa/Detalhe com API real | Frontend | 5 |
| [HU-28](sprint-3-backend-persistencia/HU-28-app-offline-first-sqlite.md) | App: persistência offline (expo-sqlite) + fila de sync | Frontend | 8 |

### Sprint 4 — Cozinha em tempo real
| HU | Título | Camada | Pontos |
|---|---|---|---|
| [HU-29](sprint-4-cozinha-tempo-real/HU-29-backend-send-to-kitchen.md) | Backend: enviar comanda para cozinha (gera ticket) | Backend | 3 |
| [HU-30](sprint-4-cozinha-tempo-real/HU-30-backend-atualizar-status-item.md) | Backend: atualizar status por item | Backend | 2 |
| [HU-31](sprint-4-cozinha-tempo-real/HU-31-backend-kitchen-gateway-websocket.md) | Backend: KitchenGateway (WebSocket) | Backend | 5 |
| [HU-32](sprint-4-cozinha-tempo-real/HU-32-app-cliente-websocket.md) | App: cliente WebSocket (subscribe/deltas) | Frontend | 5 |
| [HU-33](sprint-4-cozinha-tempo-real/HU-33-app-reconexao-ressincronizacao.md) | App: reconexão e ressincronização via REST | Frontend | 3 |
| [HU-34](sprint-4-cozinha-tempo-real/HU-34-app-tela-enviado-cozinha.md) | App: tela Enviado à cozinha (ticket + stepper) | Frontend | 3 |
| [HU-35](sprint-4-cozinha-tempo-real/HU-35-app-tela-em-preparo.md) | App: tela Em preparo | Frontend | 2 |
| [HU-36](sprint-4-cozinha-tempo-real/HU-36-app-tela-pronto-marcar-entregue.md) | App: tela Pronto + marcar como entregue | Frontend | 3 |
| [HU-37](sprint-4-cozinha-tempo-real/HU-37-app-tela-entregue.md) | App: tela Entregue (aviso "ainda não paga") | Frontend | 2 |

### Sprint 5 — Fechar conta
| HU | Título | Camada | Pontos |
|---|---|---|---|
| [HU-38](sprint-5-fechar-conta/HU-38-backend-close-order.md) | Backend: endpoint closeOrder | Backend | 2 |
| [HU-39](sprint-5-fechar-conta/HU-39-app-fechar-conta-confirmacao.md) | App: ação Fechar conta com confirmação | Frontend | 3 |
| [HU-40](sprint-5-fechar-conta/HU-40-app-mover-aba-pagas.md) | App: mover comanda para aba Pagas | Frontend | 2 |
| [HU-41](sprint-5-fechar-conta/HU-41-regra-liberar-mesa.md) | Regra de negócio: liberar mesa quando todas comandas fecham | Fullstack | 3 |
| [HU-42](sprint-5-fechar-conta/HU-42-auditoria-fechamento.md) | Auditoria: registrar operador que fechou a conta | Fullstack | 2 |

### Sprint 6 — Produção & publicação
| HU | Título | Camada | Pontos |
|---|---|---|---|
| [HU-43](sprint-6-producao-publicacao/HU-43-eas-build.md) | Configurar EAS Build (iOS + Android) | Ops | 3 |
| [HU-44](sprint-6-producao-publicacao/HU-44-apple-developer-review.md) | Conta Apple Developer + processo de revisão | Ops | 2 |
| [HU-45](sprint-6-producao-publicacao/HU-45-publicacao-play-store.md) | Publicação na Play Store | Ops | 2 |
| [HU-46](sprint-6-producao-publicacao/HU-46-piloto-restaurante-real.md) | Piloto no restaurante real (testes de campo) | Fullstack | 5 |
| [HU-47](sprint-6-producao-publicacao/HU-47-comprovante-digital.md) | Comprovante digital (opcional) | Fullstack | 3 |
| [HU-48](sprint-6-producao-publicacao/HU-48-monitoramento-erros.md) | Monitoramento de erros (crash/log reporting) | Backend/Frontend | 3 |

## Template usado em cada HU

```markdown
# HU-XX · Título

**Sprint:** N — Nome
**Épico:** ...
**Camada:** Frontend | Backend | Fullstack | Ops
**Story points:** N

## História de usuário
Como **<papel>**, quero **<capacidade>**, para que **<benefício>**.

## Critérios de aceite
- [ ] ...

## Escopo técnico
- Referência às specs (`.specs/...`) e endpoints/telas envolvidos

## Fora de escopo
- ...

## Dependências
- HU-YY / Nenhuma

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
```
