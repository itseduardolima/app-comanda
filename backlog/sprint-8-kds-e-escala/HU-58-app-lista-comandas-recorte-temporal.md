# HU-58 · App: lista de comandas com recorte temporal e carregamento incremental

**Sprint:** 8 — KDS e escala
**Épico:** Escala e Desempenho
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom**, quero **ver por padrão as comandas de hoje e ir carregando mais conforme rolo**, para que **eu ache rápido a mesa que preciso sem esperar a lista inteira do histórico**.

## Critérios de aceite
- [ ] A tela `01 Comandas` ganha um seletor de período com **Hoje · Ontem · Últimos 7 dias**, conforme moldura 6B; o padrão ao abrir o app é **Hoje**.
- [ ] O filtro **"Todas"** (sem recorte de data) deixa de existir; os chips de status permanecem **Todas · Abertas · Pagas** e passam a operar **dentro** do período selecionado.
- [ ] O cabeçalho do recorte mostra o dia por extenso e a contagem — ex.: "Hoje · qua, 19/07 · 38 comandas" — vindo do `total` do envelope da API.
- [ ] Páginas de **20** itens, com a próxima página disparada automaticamente a **400px do fim** da lista (moldura 6B); nunca há botão "carregar mais" manual como caminho principal.
- [ ] Rodapé permanente da lista mostra "Mostrando N de M de hoje"; enquanto a próxima página carrega, exibe "Carregando mais 20…" — **spinner dentro do elemento, nunca spinner de tela cheia** (regra da moldura 7).
- [ ] Quando não há mais páginas, o rodapé vira "Fim da lista · ver ontem", e tocá-lo troca o período para o dia anterior.
- [ ] Primeiro carregamento da lista usa **skeleton** com a forma dos cards, exibido só após **250ms**; abaixo disso não mostra nada (regra da moldura 7).
- [ ] Trocar de período ou de chip de status **reinicia a paginação** (cursor descartado) e cancela requisições em voo, sem misturar resultados de recortes diferentes.
- [ ] Comandas criadas ou atualizadas em tempo real (evento `order.updated`) só entram/atualizam a lista se pertencerem ao recorte visível; uma comanda de hoje aparece no topo do grupo "Agora" sem recarregar a página.
- [ ] O agrupamento visual da moldura 6B é respeitado: "Agora" (comandas abertas) acima, "Mais cedo · <hora>" para o restante.
- [ ] Offline: a lista serve o cache local do recorte já baixado e sinaliza que está desatualizada; rolar além do que está em cache não gera erro, apenas informa que precisa de conexão.
- [ ] Teste de tela cobre: carga inicial, paginação até o fim, troca de período reiniciando o cursor e lista vazia.

## Escopo técnico
- Consome o novo contrato de `GET /api/orders?date=&status=&cursor=&limit=` (HU-57): `frontend/src/api/` e `frontend/src/types/` precisam do envelope `{ data, page }`.
- Estilos via `create-styles` / tokens do tema — sem estilo inline (regra de lint do projeto).
- Referências: moldura 6B do [protótipo v2](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html), moldura 7 (skeleton vs. spinner), moldura 8A (densidade da lista a 390/320pt: valor e badge nunca encolhem, nome do cliente trunca).

## Fora de escopo
- Seletor de data arbitrária (calendário) — só Hoje/Ontem/Últimos 7 dias no MVP deste sprint.
- Busca textual e ordenação customizável.
- Resumo de vendas do dia (aba Vendas).

## Dependências
- HU-57 (paginação e recorte no backend), HU-27 (integração de comandas com a API)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
