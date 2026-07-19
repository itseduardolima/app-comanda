# HU-53 · Componente de confirmação substituindo o Alert nativo

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 8

## História de usuário
Como **garçom trabalhando de pé, com uma mão**, quero **que as confirmações apareçam como folha na metade de baixo da tela, mostrando a consequência da ação**, para que **eu alcance os botões com o polegar e não feche uma conta por engano** — e como **desenvolvedor**, para que **a confirmação funcione também no react-native-web, onde o `Alert` nativo simplesmente não roda**.

## Critérios de aceite
- [ ] Componente `ConfirmSheet` em `src/components/confirm-sheet/` com sibling de estilos, apresentado como bottom sheet — nunca diálogo centralizado (decisão registrada na seção 4 do protótipo).
- [ ] Entrada: `translateY 100%→0` em `240ms · ease-out`, com o scrim `#211E1A` a 45% de opacidade interpolando `opacity 0→1` nos mesmos 240ms. Saída em `180ms · ease-in` (seção 4).
- [ ] Arraste para baixo maior que 90px cancela a folha (seção 4).
- [ ] Em ação **neutra**, toque no backdrop cancela; em ação **destrutiva**, toque fora não confirma nem cancela — só o botão decide (seção 4).
- [ ] O botão destrutivo fica à direita e embaixo, nunca sob o polegar em repouso (seção 4).
- [ ] Todos os usos de `Alert` de `app/(tabs)/profile/index.tsx`, `app/orders/[id]/index.tsx` e `app/orders/[id]/kitchen.tsx` são substituídos; nenhum `import { Alert }` sobra em `app/**` (verificável por grep) e as confirmações funcionam no build web.
- [ ] **Moldura 4A** — fechar conta: a folha repete o total em 26px como elemento dominante, lista mesa/cliente/contagem de itens, diz que a comanda sai da lista de abertas, que a mesa só é liberada quando a última comanda dela fechar, e que não dá para desfazer. Botões "Voltar" e "Fechar conta".
- [ ] **Moldura 4B** — sair da conta: variante neutra usa preto (`theme.colors.text`), não terracota. Quando há fila pendente, o bloco de status vira aviso `theme.colors.warningSoft` e o botão "Sair" fica desabilitado até a fila drenar.
- [ ] **Moldura 4C** — remover item ainda não enviado: a folha mostra o item, o rótulo "ainda não foi enviado" e a consequência em dinheiro ("o total passa de R$ 63,00 para R$ 49,00"); botões "Manter" e "Remover".
- [ ] **Moldura 4D** — item já enviado à cozinha: a ação de remover **não é oferecida** na lista (sem swipe, sem lixeira, sem menu); o item exibe apenas o status "Já na cozinha · desde HH:MM". A regra é do servidor, que responde `409 · Cannot modify an item already sent to the kitchen`.
- [ ] Todos os textos, incluindo os valores formatados em reais, saem de `src/i18n/pt-BR.ts`; valores continuam vindo em centavos da API e são convertidos só na exibição.
- [ ] Testes em `frontend/__tests__/` cobrem: backdrop não confirma em variante destrutiva, "Sair" desabilitado com fila pendente, e ausência de qualquer affordance de remoção para item já enviado.

## Escopo técnico
- Referência: protótipo [`App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html`](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html), seção 4 e molduras 4A–4D.
- A folha pode ser implementada com `Modal` + Reanimated, ou com `react-native-gesture-handler` para o arraste; a escolha é registrada no PR desde que o comportamento acima seja atendido e o web funcione.
- Renderização via provider global (ex.: `ConfirmSheetProvider` em `app/_layout.tsx`) para que qualquer tela abra a folha por hook, sem montar modal na mão.

## Fora de escopo
- Substituir 4C por toast com "Desfazer" — o protótipo cita a alternativa, mas o sprint mantém a folha; o toast fica registrado como possibilidade futura.
- Ação de remover item já enviado, em qualquer forma (o backend rejeita com 409).
- Diálogo centralizado como fallback de plataforma.
- Troca de PIN e configuração de impressora no Perfil — não existem no produto (nota da moldura 4B).

## Dependências
- HU-49

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
