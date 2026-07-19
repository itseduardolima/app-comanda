# HU-50 · Componente Skeleton e aplicação nas listas

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom**, quero **ver a forma do conteúdo enquanto ele carrega, em vez de tela branca ou spinner solto**, para que **eu saiba que o app está trabalhando e o layout não salte quando os dados chegarem**.

## Critérios de aceite
- [ ] Componente `Skeleton` em `src/components/skeleton/` com sibling `skeleton.styles.ts`, aceitando `width`, `height` e `radius`, e uma variante de bloco de texto com múltiplas linhas.
- [ ] O bloco usa `theme.colors.track` (`#E9E4DB`) como base e uma faixa de varredura sólida em `theme.colors.neutralSoft` (`#F2EEE7`), sem gradiente, conforme a legenda da seção 1 do protótipo.
- [ ] A faixa tem 38% da largura do bloco e percorre `translateX` de −40% a 140% em `1100ms · linear · loop`, conforme a legenda da seção 1.
- [ ] O skeleton só aparece após 250ms de espera (via `useDelayedFlag` da HU-49); abaixo disso a tela fica quieta, sem piscar nada.
- [ ] A saída do skeleton é um fade-out de `160ms · ease-out` em cross-fade com o conteúdo real, sem colapso de altura (moldura 1B).
- [ ] Com "reduzir movimento" ativo, o bloco é exibido estático, sem a faixa de varredura.
- [ ] **Moldura 1A** — lista de comandas: cabeçalho e barra de abas são reais desde o primeiro frame; só o miolo é skeleton. São 3 cards fixos, o terceiro a 62% de opacidade, e a varredura é defasada em 90ms por card.
- [ ] **Moldura 1B** — cardápio: a miniatura quadrada de 46px é reservada no skeleton para o layout não pular quando a imagem chegar.
- [ ] **Moldura 1C** — detalhe da comanda: a barra de total nunca exibe `R$ 0,00` enquanto carrega; o valor é substituído por um bloco de skeleton.
- [ ] **Moldura 1D** — ticket de cozinha: o stepper carrega como trilho neutro, nunca com a etapa 1 preenchida.
- [ ] Todos os títulos de carregamento visíveis (ex.: "Carregando cardápio…") vêm de `src/i18n/pt-BR.ts`.
- [ ] Testes em `frontend/__tests__/` cobrem: skeleton não aparece antes de 250ms, aparece depois, e a barra de total do detalhe não renderiza `R$ 0,00` no estado de carregamento.

## Escopo técnico
- Telas afetadas: `app/(tabs)/orders/index.tsx`, `app/(tabs)/menu/index.tsx`, `app/orders/[id]/index.tsx`, `app/orders/[id]/kitchen.tsx`.
- Estilos de tela em `src/styles/screens/*.styles.ts`; estilo do componente no sibling. Nenhum estilo inline (`.specs/03-estilos.md`).
- Referência: protótipo [`App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html`](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html), molduras 1A–1D e a nota da seção 7 (skeleton quando a forma do conteúdo é previsível).

## Fora de escopo
- Skeleton em telas cuja forma não é previsível (Vendas, Perfil) — a seção 7 do protótipo restringe skeleton a lista, cardápio, detalhe e ticket.
- Spinner de botão e pílula de sincronização (HU-51).
- Estado vazio e estado de erro dessas mesmas listas (HU-52).
- Skeleton em telas de autenticação — a espera ali é consequência de toque, caso de spinner.

## Dependências
- HU-49

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
