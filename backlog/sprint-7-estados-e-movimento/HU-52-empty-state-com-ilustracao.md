# HU-52 · Componente EmptyState com ilustração

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 8

## História de usuário
Como **garçom**, quero **que toda tela sem conteúdo me diga o que aconteceu e o que fazer em seguida**, para que **eu não confunda "não tem nada" com "quebrou" nem fique preso numa tela em branco no meio do salão**.

## Critérios de aceite
- [ ] Componente `EmptyState` em `src/components/empty-state/` com sibling de estilos, composto por ilustração + título + subtítulo + ação primária + ação secundária opcional, todos os textos por `src/i18n/pt-BR.ts`.
- [ ] As ilustrações usam apenas `path`, `circle`, `rect`, `line` e `g`, traço de 1.7px, no máximo duas cores (`theme.colors.textFaint` `#B4AEA4` para estrutura e `theme.colors.primary` `#C4472A` para acento), preenchimento `theme.colors.primarySoft` `#FBEDE8`, `viewBox 0 0 180 150` e altura renderizada de 150px — sem filtro, máscara ou gradiente (legenda da seção 2).
- [ ] As ilustrações vivem em `src/components/illustrations/`, uma por arquivo, e recebem as cores do tema por prop — nenhum hex literal fora de `tokens.ts`.
- [ ] **Moldura 2A** — nenhuma comanda aberta: as abas de filtro continuam visíveis e a ação primária ("Nova comanda") fica na mesma posição do botão da lista cheia; ação secundária leva às comandas de hoje.
- [ ] **Moldura 2B** — nenhuma comanda paga: vazio informativo, com a ação levando de volta ao filtro que tem conteúdo ("Ver as N abertas").
- [ ] **Moldura 2C** — categoria sem itens: a barra fixa da comanda continua no rodapé com contagem, valor e rótulo em `flex: none` e sem quebra, 12px entre eles; a ação é "Buscar no cardápio".
- [ ] **Moldura 2D** — comanda sem itens: "Fechar conta" não é renderizado (não existe conta de R$ 0,00) e o botão único "Adicionar itens" ocupa a largura toda com alvo de 54px.
- [ ] **Moldura 2E** — nenhum ticket na cozinha: exibe o carimbo "Conectado · última leitura HH:MM" a partir do estado real do socket, provando que a tela está viva.
- [ ] **Moldura 2F** — sem conexão com N pendentes: usa a paleta de aviso (`theme.colors.warningSoft` / `warningBorder`), nunca a de erro; lista as alterações aguardando envio e oferece "Tentar agora".
- [ ] **Moldura 2G** — falha ao carregar: sempre há saída secundária (cache local com horário explícito, ex.: "Usar cardápio salvo (18:30)") e o código do erro aparece em corpo pequeno no rodapé, tocável para copiar.
- [ ] Cada estado é escolhido a partir do estado real do hook correspondente (vazio ≠ carregando ≠ erro ≠ offline) e nunca aparece junto com o skeleton da HU-50.
- [ ] Testes em `frontend/__tests__/` cobrem: 2D não renderiza o botão de fechar conta, 2F usa a paleta de aviso (asserção contra `defaultTheme.colors.*`) e 2G renderiza a ação secundária de cache.

## Escopo técnico
- Telas afetadas: `app/(tabs)/orders/index.tsx` (2A, 2B), `app/(tabs)/menu/index.tsx` (2C, 2G), `app/orders/[id]/index.tsx` (2D), `app/orders/[id]/kitchen.tsx` (2E), lista de comandas offline (2F).
- Referência: protótipo [`App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html`](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html), seção 2 e molduras 2A–2G.
- `react-native-svg` vem da HU-49.

## Fora de escopo
- Busca no cardápio em si: a ação de 2C navega para a busca existente; construir busca nova não é desta HU.
- Telas de erro de servidor 6C·1/6C·2/6C·3 (fora do escopo do sprint).
- Animação de entrada das ilustrações — o protótipo não especifica movimento para estados vazios.
- Ilustração para Vendas e Perfil, que não têm estado vazio desenhado.

## Dependências
- HU-49

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
