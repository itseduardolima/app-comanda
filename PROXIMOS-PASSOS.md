# Próximos passos

> Recomendações para levar o App do Garçom de "MVP funcional" a "rodando num restaurante de verdade".
>
> Escrito a partir do estado real do código (julho/2026), não de boas práticas genéricas. Cada item cita onde o problema está. Quando algo é opinião e não fato verificado, está dito.
>
> Complementa — não substitui — o [`backlog/`](backlog/), que continua sendo a fonte do que fazer por sprint. Este documento é sobre **ordem e risco**, não sobre escopo.

## Onde o projeto está

O MVP está funcionalmente completo: as 14 telas do protótipo existem, a API cobre auth, cardápio, mesas, comandas, cozinha e fechamento, o app é offline-first com fila de sincronização, e o tempo real entrega deltas puros por WebSocket. Backend com 41 testes unitários + 35 e2e; frontend com 70.

O que falta **não é funcionalidade**. É o cinto de segurança que separa "funciona na minha máquina" de "funciona no sábado à noite, com 8 mesas cheias e o Wi-Fi do salão oscilando".

---

## Tier 1 — Bloqueadores do piloto

Nada disso é opcional antes de colocar na mão de um garçom real.

### 1. Monitoramento de erros (HU-48)

**Hoje não existe.** Sem Sentry ou equivalente, um crash no meio do serviço vira "o app fechou sozinho" no relato do garçom, e você não tem stack trace, versão, nem operador. É o único item do backlog que é pré-requisito para *aprender* com o piloto, em vez de só sobreviver a ele.

Mínimo: `@sentry/react-native` no app e `@sentry/node` no backend, com `release`/`dist` amarrados ao build do EAS, e scrubbing explícito de PIN e JWT antes do envio. O `HttpExceptionFilter` (`backend/src/common/filters/http-exception.filter.ts`) hoje só formata a resposta — é o ponto natural para reportar.

### 2. Development build (HU-43)

O Expo Go da App Store não suporta o SDK 57, então **hoje não há como rodar no iPhone**. Isso não é um detalhe de conveniência: sem build instalável, não há piloto. Depende da conta Apple Developer (HU-44).

Vale aproveitar para decidir a estratégia de atualização: EAS Update (OTA) permite corrigir bug de JS no meio do serviço sem passar pela revisão da Apple — num app usado durante o expediente, isso é a diferença entre "corrigido em 10 minutos" e "corrigido semana que vem".

### 3. Fechar a conta trava na web

`Alert` do React Native não é implementado pelo `react-native-web`. Os botões "Sair" (`app/(tabs)/profile/index.tsx`) e "Fechar conta" (`app/orders/[id]/index.tsx`) provavelmente **não fazem nada no navegador** — verificado indiretamente durante os testes, quando foi preciso fechar a conta pela API.

No iOS/Android funciona. Mas como a web virou o caminho de teste enquanto o Expo Go está bloqueado, isso cega justamente os dois fluxos mais críticos. Um componente de confirmação próprio (que já respeitaria o design do protótipo, diferente do alerta nativo) resolve os dois problemas.

### 4. CI

**Não existe `.github/workflows`.** Todo o `typecheck`/`lint`/`test` depende de alguém lembrar de rodar. O projeto tem 146 testes e regras de lint que travam estilo inline — tudo isso só protege se rodar automaticamente em cada push.

Um workflow simples (backend e frontend em paralelo, Postgres de serviço para o e2e) é meia hora de trabalho e passa a valer para sempre.

---

## Tier 2 — Vai doer no primeiro mês

### 5. A listagem de comandas cresce sem limite

`OrdersService.findAll` (`backend/src/orders/orders.service.ts:82`) faz `findMany` **sem paginação e sem recorte de data**, trazendo `orderInclude` completo — itens, menuItem, mesa, operador, quem fechou — para cada comanda.

O filtro "Todas" da tela de Comandas devolve, portanto, *todas as comandas já criadas na história do restaurante*, com todos os itens aninhados. Num restaurante de 80 comandas/dia, em três meses são ~7.000 comandas com ~30.000 itens numa resposta só. O app trava antes do banco.

Some-se a isso: **o schema não tem um único `@@index`** (só três `@unique`). `order.payment_status`, `order.table_id` e `order_item.order_id` são todos varridos.

Correção: paginação (ou recorte por dia, que é o que o garçom realmente quer), índices nas colunas de filtro, e um `select` mais enxuto na listagem — a lista precisa de resumo, não da comanda inteira.

Isso é **fato verificado no código**, não projeção: o endpoint hoje não tem limite algum.

### 6. Segurança de autenticação

Três itens conhecidos e documentados no próprio código:

- **Sem lockout de PIN.** `backend/src/auth/auth.service.ts` admite a ausência num comentário. Um PIN de 4 dígitos sem bloqueio são 10.000 tentativas — trivial de varrer, e as rotas `/auth/*` são `@Public()`.
- **Sem rate limit.** `@nestjs/throttler` não está instalado.
- **CORS aberto.** `app.enableCors()` sem origin (`backend/src/main.ts:11`) e `origin: '*'` no gateway (`backend/src/kitchen/kitchen.gateway.ts`).

Num app de salão o vetor realista não é o hacker: é o celular do garçom esquecido numa mesa. Lockout + expiração de sessão por inatividade cobrem o caso real.

### 7. Cobertura de teste onde falta

Hoje existe **um** teste de tela (`frontend/__tests__/login-screen.test.tsx`). O resto de `app/**` não tem nenhum, e é o motivo de a maioria das HUs estar "Parcial" no backlog.

Prioridade não é cobrir tudo — é cobrir o que dói: fechar conta, adicionar item offline e a fila de sincronização sob perda de conexão. No backend, `menu` e `tables` não têm spec própria nem e2e.

Ao escrever teste de tela, lembre: **o require-context do Expo Router não exclui `.test.tsx`**, então um teste dentro de `app/` vira rota de verdade. Por isso o teste de login mora em `frontend/__tests__/`.

---

## Tier 3 — Específico deste domínio

Coisas que só aparecem quando o app encosta num restaurante de verdade. Aqui há mais recomendação do que fato — o piloto é que vai dizer o que importa.

### 8. A cozinha não tem tela

Todo o fluxo de status (`queued → preparing → ready → delivered`) hoje depende de **alguém tocar no app do garçom**. Numa cozinha real ninguém vai pegar o celular do garçom com a mão suja para marcar "pronto".

As duas saídas usuais: um **KDS** (tablet fixo na cozinha com a fila de tickets, que o gateway já suporta — as rooms e os eventos existem) ou **impressora térmica** de comanda. O backend já está pronto para o KDS; é um cliente novo, não uma mudança de arquitetura.

Isso provavelmente será o primeiro pedido do restaurante depois do piloto.

### 9. Dois garçons na mesma comanda

O offline-first resolve conflito com o servidor, mas não conflito **entre pessoas**. Dois garçons editando a mesma comanda hoje disputam por "último a sincronizar vence".

O gateway já difunde deltas, então o caso comum (ver o item do outro aparecer) funciona. O caso feio é edição simultânea do mesmo item. Antes de investir em resolução de conflito, vale medir no piloto se isso acontece — em muitos salões cada garçom tem suas mesas e o problema nunca aparece.

### 10. Fiscal e LGPD

O escopo exclui pagamento, o que é uma decisão de produto sólida. Mas num restaurante brasileiro real, em algum momento aparecem:

- **NFC-e / SAT / cupom fiscal.** Não precisa estar no app, mas precisa haver resposta clara de como se integra ao que o restaurante já usa. Provavelmente exportar a comanda fechada, não emitir nota.
- **LGPD.** `customerName` é dado pessoal, ainda que trivial. E `closedById` cria trilha de auditoria sobre trabalhador identificado — isso tem implicação trabalhista, não só técnica. Defina retenção (ex.: comandas anonimizadas após N meses) antes de acumular dados.

### 11. Realidade do dispositivo

- **Bateria**: um turno são 6-8h com a tela ligada e WebSocket aberto. Testar autonomia real no piloto.
- **Wi-Fi de salão** costuma ser ruim justamente onde há mais gente. A fila offline cobre isso, mas vale medir quantas mutações ficam pendentes e por quanto tempo.
- **Mão ocupada, tela suja, pouca luz.** O protótipo tem alvos de toque generosos, o que ajuda. Modo escuro está fora do MVP por decisão registrada em `tokens.ts` — pode voltar à mesa se o salão for escuro.

---

## Tier 4 — Depois que estiver rodando

- **Backup do Postgres.** Hoje só existe o `docker-compose` de desenvolvimento. Produção precisa de backup automático e de um restore *testado* — backup nunca verificado é backup que não existe.
- **Aba Vendas.** Existe como tela, mas o resumo do **dia** — total, número de comandas, ticket médio — é o que o dono do restaurante realmente quer. É provavelmente a primeira funcionalidade pedida por quem paga. Nota: **turnos foram descartados**; o recorte do produto é o dia, sem noção de abertura/fechamento de expediente.
- **Swagger/OpenAPI.** O contrato vive só no markdown (`.specs/03-api-contrato.md`). Vira dívida no dia em que um segundo cliente (KDS, backoffice) for escrito.
- **PDV e Backoffice.** O projeto de design já tem `PDV Fogo e Brasa.dc.html` e `Backoffice Fogo e Brasa.dc.html` — há visão de produto além do app do garçom.

---

## O que NÃO fazer agora

Igualmente importante:

- **Não resolva conflito multi-usuário antes de observá-lo.** Pode ser um problema inexistente no fluxo real.
- **Não migre para monorepo com workspaces, microserviços ou fila de mensagens.** O volume não justifica; um Postgres e um Nest dão conta de um restaurante com folga.
- **Não persiga 100% de cobertura.** Cubra fechar conta, sincronização offline e transições de cozinha. O resto é enfeite.
- **Não faça downgrade de SDK** para caber no Expo Go. É trabalho descartável — a App Store alcança o SDK 57 em algumas semanas, e o development build é o destino de qualquer forma.

---

## Sugestão de ordem

| # | O quê | Por quê primeiro |
|---|---|---|
| 1 | CI | Protege todo o resto, custa pouco |
| 2 | Sentry (app + API) | Sem isso o piloto não ensina nada |
| 3 | Development build + conta Apple | Sem isso não há piloto |
| 4 | Confirmação própria no lugar do `Alert` | Desbloqueia testar fechar conta |
| 5 | Paginação + índices na listagem | Antes que o volume chegue |
| 6 | Lockout + rate limit | Antes de sair do laboratório |
| 7 | **Piloto** (HU-46) | Aqui é onde o aprendizado começa |
| 8 | KDS ou impressora | Provavelmente o primeiro pedido de volta |

Os itens 1-6 são semanas, não meses. O item 7 é o que reordena tudo abaixo dele — por isso não vale planejar muito além dele.
