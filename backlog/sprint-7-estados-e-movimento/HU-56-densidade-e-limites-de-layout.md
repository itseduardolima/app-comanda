# HU-56 · Densidade e limites de layout

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom com um aparelho de tela pequena e a fonte do sistema ampliada**, quero **que valor, status e identificação da mesa continuem legíveis mesmo com nome comprido e conta de quatro dígitos**, para que **eu não leia um preço truncado na hora de falar o total em voz alta**.

## Critérios de aceite
- [ ] Regra geral aplicada em todas as telas densas (seção 8): valor e status **nunca** encolhem nem truncam; nome de item **quebra linha**; nome de cliente e rótulo de navegação **truncam**; nenhum alvo de toque fica abaixo de 44pt.
- [ ] **Moldura 8A** — lista de comandas a 390pt e 320pt: nome do cliente e a linha "N itens · N min" truncam com reticências; valor (`flex: none`, sem quebra, com espaço rígido em `R$ `), badge de status e identificação da mesa são `flex: none`. Os chips de filtro viram faixa rolável horizontal e, a 320pt, o terceiro chip aparece cortado como affordance. Cabe um card a menos — a altura do card não é reduzida.
- [ ] **Moldura 8B** — linha `quantidade · nome · preço` do detalhe: quantidade em coluna fixa de 30px (`flex: none`, suportando `12×` sem empurrar nada); nome em `flex: 1` com `minWidth: 0`, quebrando por palavra em até 3 linhas e **nunca** truncando; preço em `flex: none` sem quebra, com 12px de respiro mínimo.
- [ ] **Moldura 8B** — refluxo do preço: o preço só permanece na mesma linha se o nome couber inteiro em uma linha no espaço restante; caso contrário desce alinhado à direita, sob o nome. O arranjo é o mesmo para todos os itens da lista — nenhuma linha mistura os dois formatos.
- [ ] A linha única (nome e preço no mesmo eixo) permanece nas folhas de confirmação (4A) e no toast (5C), onde a coluna é larga e o nome é curto.
- [ ] **Moldura 8B** — a 320pt o par de botões do rodapé vira coluna, porque "Fechar conta" não cabe lado a lado sem truncar rótulo de ação destrutiva. O total é 20px nas duas larguras.
- [ ] **Moldura 8C** — cardápio: nome do item quebra em até 2 linhas; a miniatura cai de 46 para 40px e o card cresce em altura; preço, botão "+" (34px nas duas larguras) e o valor da barra da comanda nunca encolhem; o rótulo da barra inferior vira "Ver" nas duas larguras; o subtítulo do cabeçalho trunca. A barra inferior nunca some.
- [ ] **Moldura 8D** — fonte do sistema a 130%: todo preço desce para a linha de baixo (mesma regra de 8B, disparada pela fonte); o par de botões vira coluna; o subtítulo do cabeçalho quebra em duas linhas; a lista de itens vira scroll com indicador "↓ mais N itens".
- [ ] **Moldura 8D** — nenhum container em volta de texto usa `height` fixa, apenas `minHeight`; alturas de alvo de toque só crescem (54→60px), nunca encolhem; a escala de fonte é limitada a 200% (`maxFontSizeMultiplier`), e acima disso o app usa o valor de 200% e a tela rola.
- [ ] **Moldura 8E** — tablet: a régua de conteúdo trava em 560pt e centraliza, com `theme.colors.background` (`#F7F5F1`) preenchendo as laterais; a barra de abas continua embaixo, sem virar lateral e sem layout de duas colunas.
- [ ] **Moldura 8E** — rotação: `app.json` declara `orientation: "portrait"` e o app não oferece paisagem no celular.
- [ ] Testes em `frontend/__tests__/` cobrem, com dados de pior caso (item de 40 caracteres, `12×`, `R$ 1.234,56`, "Maria Aparecida Gonçalves"): o valor renderiza inteiro, o nome do item não recebe `numberOfLines` de truncamento, e o nome do cliente recebe.

## Escopo técnico
- Telas afetadas: `app/(tabs)/orders/index.tsx`, `app/orders/[id]/index.tsx`, `app/(tabs)/menu/index.tsx`, e o container raiz de `app/_layout.tsx` para a régua de 560pt.
- Referência: protótipo `design-v2.dc.html`, seção 8 e molduras 8A–8E.
- Ajustes exclusivamente em `src/styles/screens/*.styles.ts` e nos siblings dos componentes; nenhum estilo inline.

## Fora de escopo
- Layout de duas colunas em tablet — descartado explicitamente pela moldura 8E.
- Layout de KDS em paisagem (moldura 6A) e o comportamento de degradação do KDS em retrato: o KDS não está no escopo do app do garçom.
- Recorte temporal e paginação da lista (moldura 6B), que dependem de parâmetros novos em `GET /orders`.
- Modo escuro e temas alternativos.

## Dependências
- HU-50
- HU-52
- HU-53

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
