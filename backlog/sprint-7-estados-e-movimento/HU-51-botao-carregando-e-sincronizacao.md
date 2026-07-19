# HU-51 · Botão em carregamento e indicador de sincronização

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom**, quero **que o botão que eu toquei mostre que está trabalhando e que a fila offline drenando apareça sem me bloquear**, para que **eu não toque duas vezes na mesma ação nem fique na dúvida se o pedido subiu**.

## Critérios de aceite
- [ ] `Button` (`src/components/ui/button/`) ganha prop `loading` que desabilita o toque e troca o rótulo por um texto de gerúndio recebido por prop (`loadingLabel`), vindo de `src/i18n/pt-BR.ts` — moldura 1E.
- [ ] A largura do botão é congelada no valor do rótulo original antes da troca de texto, para o alvo de toque não mudar de tamanho sob o dedo (moldura 1E).
- [ ] O spinner é um arco de 90° girando `0→360°` em `800ms · linear · loop`, e só aparece após 400ms de espera; abaixo disso o botão apenas desabilita, sem piscar (moldura 1E).
- [ ] Variante primária em carregamento mantém fundo `theme.colors.primary` (`#C4472A`) e texto a 100% de opacidade — não escurece (moldura 1E).
- [ ] Variante secundária mantém a borda e leva o conteúdo para `theme.colors.textMuted` (`#8C867C`); variante ghost fica sem fundo, só arco e texto tênue (moldura 1E).
- [ ] Botão em `loading` expõe `accessibilityState={{ disabled: true, busy: true }}` e não dispara `onPress`.
- [ ] Componente `SyncPill` em `src/components/sync-pill/` com sibling de estilos, exibindo "Sincronizando N alterações…" e o progresso da fila ("2 de 5 enviadas · nenhuma perdida"), textos por i18n — moldura 1F.
- [ ] A pílula é renderizada dentro da régua de conteúdo, nunca como overlay: nada da tela fica bloqueado ou coberto (moldura 1F).
- [ ] A pílula entra em `180ms · ease-out` interpolando `opacity 0→1` e `translateY −6→0`, e sai em `140ms`; se a fila drenar em menos de 600ms, ela não chega a aparecer (moldura 1F).
- [ ] A contagem vem do estado real da fila de `src/db/sync-queue.ts`, exposto por hook — a tela não importa `src/db` (regra de camadas do `CLAUDE.md`).
- [ ] Testes em `frontend/__tests__/` cobrem: `onPress` não dispara com `loading`, largura não muda entre estados, e a pílula não aparece quando a fila drena antes de 600ms.

## Escopo técnico
- Botões afetados hoje: enviar à cozinha (`app/orders/[id]/index.tsx`), fechar conta, criar comanda, verificar PIN.
- Referência: protótipo [`App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html`](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html), molduras 1E e 1F, e seção 7 ("spinner quando a espera é consequência de um toque").
- Novos textos em `src/i18n/pt-BR.ts`; nenhuma string hardcoded.

## Fora de escopo
- Spinner centralizado em tela cheia — o protótipo o proíbe explicitamente (seção 7).
- Banner persistente de reconexão, que é microinteração da moldura 3F (HU-55).
- Toast de "sem conexão" (HU-54).
- Retentativa automática com backoff da fila — comportamento já existente, não muda aqui.

## Dependências
- HU-49

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
