# HU-57 · Backend: paginação e recorte por dia na listagem de comandas

**Sprint:** 8 — KDS e escala
**Épico:** Escala e Desempenho
**Camada:** Backend
**Story points:** 5

## História de usuário
Como **garçom**, quero **que a listagem de comandas traga apenas o dia que estou olhando, em páginas**, para que **a tela abra rápido no sábado à noite e não carregue o histórico inteiro do restaurante a cada toque**.

## Critérios de aceite
- [ ] `GET /api/orders` aceita `?date=YYYY-MM-DD&status=open|paid|all&cursor=<opaco>&limit=<1..50>`; `date` ausente assume **hoje** (fuso do restaurante, não UTC cru).
- [ ] `limit` ausente assume **20**; `limit > 50` é rejeitado com 400; `date` fora do formato `YYYY-MM-DD` e `cursor` inválido também retornam 400 com o padrão de erro NestJS.
- [ ] O recorte de `date` filtra por `created_at` dentro do dia local `[00:00, 24:00)` — não existe noção de turno/expediente (turnos foram descartados; o recorte do produto é o DIA).
- [ ] Resposta passa a ser um envelope `{ data: [...], page: { nextCursor: string | null, hasMore: boolean, total: number } }`, onde `total` é a contagem do recorte (dia + status) — é o número exibido em "Mostrando 20 de 38 de hoje" (moldura 6B).
- [ ] Paginação é **por cursor estável** sobre `(created_at desc, id desc)`, não `offset`: inserir uma comanda nova durante a rolagem não duplica nem pula linhas.
- [ ] A listagem usa um `select` de **resumo**, não o `orderInclude` completo: id, tipo, mesa (número), nome do cliente, `payment_status`, `created_at`, quantidade de itens, total em centavos e o resumo de status de cozinha — sem devolver o array de itens com `menuItem` aninhado por comanda.
- [ ] `prisma/schema.prisma` ganha `@@index` em `order(created_at)`, `order(payment_status, created_at)`, `order(table_id)` e `order_item(order_id)`, com migration versionada aplicada (`prisma migrate`) — hoje o schema não tem **nenhum** `@@index`.
- [ ] `.specs/03-api-contrato.md` atualizado no mesmo commit: a linha de `GET /api/orders` passa a documentar `date`, `cursor`, `limit` e o envelope de resposta — **isto é mudança de contrato** e quebra `frontend/src/api/` e `frontend/src/types/` se não for acompanhada.
- [ ] Teste e2e cobre: página cheia com `hasMore = true`, última página com `nextCursor = null`, dia sem comandas devolvendo `data: []` com `total: 0`, e `limit` inválido → 400.
- [ ] Rota continua exigindo `Authorization: Bearer <jwt>`.

## Escopo técnico
- `OrdersService.findAll` (`backend/src/orders/orders.service.ts`) hoje faz `findMany` sem paginação e sem recorte de data, com `orderInclude` completo por linha — é exatamente o problema descrito em `PROXIMOS-PASSOS.md` § "A listagem de comandas cresce sem limite".
- DTO de query (`dto/list-orders.dto.ts`) estendido com `class-validator`; lembrar que o `ValidationPipe` global é `whitelist` + `forbidNonWhitelisted`.
- Referências: `.specs/03-api-contrato.md` (seção Orders), `.specs/02-modelo-de-dados.md`, HU-23 (listagem original, que declarava paginação fora de escopo). Protótipo: [protótipo v2](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html).

## Fora de escopo
- Recortes maiores que um dia com agregação (ex.: relatório do mês) — a aba Vendas é outra HU.
- Busca textual por nome de cliente ou número de mesa.
- Cache de resposta / `ETag`.

## Dependências
- HU-23 (listar comandas com filtro)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
