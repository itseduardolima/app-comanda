# HU-49 · Infraestrutura de ilustração e movimento

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **desenvolvedor**, quero **uma base pronta para desenhar ilustrações vetoriais e animar componentes (biblioteca de SVG, tokens de motion e helpers de Reanimated)**, para que **as HUs de estado, vazio e microinteração deste sprint não reinventem duração, easing e curva cada uma do seu jeito**.

## Critérios de aceite
- [ ] `react-native-svg` é adicionado ao `package.json` na versão compatível com o Expo SDK 57 (instalada via `npx expo install react-native-svg`) e o app continua abrindo em Android, iOS e web.
- [ ] `react-native-svg` é adicionado ao `transformIgnorePatterns` do Jest se necessário, e um teste de smoke renderiza um `<Svg>` com `path`, `circle`, `rect`, `line` e `g` sem erro — os únicos elementos que o protótipo usa (conforme legenda da seção 2).
- [ ] `src/theme/tokens.ts` ganha um grupo `motion` com as durações do protótipo, nomeadas semanticamente e sem número mágico repetido: `instant 90`, `fast 140`, `quick 160`, `enter 180`, `toastIn 200`, `sheetOut 180`, `standard 190`, `emphasis 220`, `row 240`, `screen 260`, `stepper 340`, `highlightOut 430`, `shimmer 1100`, `spinner 800`.
- [ ] `src/theme/tokens.ts` expõe os easings do protótipo como valores nomeados: `easeOut = Easing.out(Easing.cubic)`, `easeInOut = Easing.inOut(Easing.quad)` e o preset de spring `damping 18 / stiffness 220 / mass 1`, conforme a legenda da seção 3.
- [ ] `src/theme/tokens.ts` expõe os limiares de espera do protótipo (seção 7): `skeletonDelay 250`, `spinnerDelay 400`, `syncPillMinDuration 600`, `reconnectDebounce 1200`.
- [ ] Existe um hook `useDelayedFlag(active, delayMs)` em `src/hooks/`, que só devolve `true` depois de o estado ficar ativo por `delayMs`, e devolve `false` imediatamente ao desativar — é o que implementa a regra "abaixo de 250ms, nada".
- [ ] Existe um helper `useReducedMotion()` que lê `AccessibilityInfo.isReduceMotionEnabled` e, quando ativo, faz os helpers de animação usarem duração `0` (estado final direto), sem quebrar layout.
- [ ] Nenhum valor de duração, easing ou cor de animação é escrito literalmente fora de `tokens.ts`; os `*.styles.ts` e componentes consomem `theme.motion.*`.
- [ ] `.specs/03-estilos.md` ganha uma seção "Movimento" documentando os tokens de motion, os easings e a regra de espera mínima.

## Escopo técnico
- `react-native-reanimated@4.5.0` já está instalado e hoje não é usado em nenhum arquivo; esta HU é a primeira a consumi-lo. Confirmar que o plugin do Babel está configurado e que o app roda com ele ativo.
- Referência: protótipo `design-v2.dc.html`, legenda da seção 3 (easings e spring), seção 7 (skeleton vs. spinner) e seção 2 (elementos SVG permitidos).
- Tokens entram em `tokens.ts` primeiro, como manda `.specs/03-estilos.md`; nada de duração inline nos componentes.

## Fora de escopo
- Qualquer componente visual novo — Skeleton, EmptyState, ConfirmSheet e Toast são das HUs seguintes.
- Biblioteca de bottom sheet de terceiros: HU-53 decide a implementação.
- `react-native-gesture-handler` para gestos avançados; o arraste do sheet é avaliado em HU-53.
- Modo escuro dos tokens de cor (decisão registrada em `tokens.ts` continua valendo).

## Dependências
- HU-02 (tema e tokens)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
