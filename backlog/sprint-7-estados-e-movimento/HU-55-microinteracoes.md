# HU-55 · Microinterações

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 8

## História de usuário
Como **garçom de pé, com o aparelho numa mão**, quero **que o app responda visivelmente ao meu toque e mostre quando o estado muda**, para que **eu responda de imediato às duas únicas perguntas que faço em serviço: "o toque funcionou?" e "o estado mudou?"**.

## Critérios de aceite
- [ ] **Moldura 3B** — item caindo na comanda: a linha nova anima `height 0→auto` (medida) + `translateY −10→0` + `scale 0.96→1` + `opacity 0→1` em `260ms · spring` (damping 18 / stiffness 220). O fundo entra `theme.colors.primarySoft` (`#FBEDE8`) e desbota para branco em `420ms · ease-out` com 260ms de atraso; a borda fica `theme.colors.primarySoftBorder` (`#E8B3A3`) por 1,2s. Haptic `selection` dispara no toque, não no fim da animação.
- [ ] **Moldura 3C** — stepper avançando: o trilho anima `width 12%→64%` em `340ms · ease-in-out`, com a cor do preenchimento interpolando `#C4472A → #3B7A57` (`theme.colors.primary → theme.colors.success`) nos mesmos 340ms. O rótulo da etapa vai de `textFaint` para `success` em 200ms, atrasado até o momento em que a barra passa por ele. O badge faz cross-fade de texto (`opacity 1→0→1`, 2×120ms) com o fundo interpolando `warningSoft → successSoft`. Um único haptic `success` ao chegar em "Pronto".
- [ ] **Moldura 3D** — chip de categoria: `backgroundColor #FFFFFF → #211E1A` e `color #57534C → #FFFFFF` em `190ms · ease-out`, e a lista faz cross-fade `opacity 1→0.35→1` em 2×110ms, **sem** deslize horizontal. A escala `1→0.97→1` do chip **não** é implementada — a nota de prioridade do protótipo a classifica como enfeite.
- [ ] **Moldura 3E** — pressionado de card e botão: down aplica `scale 1→0.975` em `90ms · ease-out` mais mudança de cor (`#FFFFFF→#F2EEE7` no card, `#C4472A→#9E3319` no botão); up volta em `140ms · ease-out`. A escala nunca desce abaixo de 0.97.
- [ ] **Moldura 3F** — banner de reconexão: entrada com `height 0→34` + `translateY −14→0` + `opacity 0→1` em `220ms · ease-out`, empurrando a lista em vez de cobri-la. Ao reconectar, o banner fica verde por 1,5s ("Conectado") e só então sai em `180ms · ease-in`. Há debounce de 1,2s antes de exibir, para o banner não tremer com wi-fi instável.
- [ ] O banner de 3F mostra a contagem da fila ("Sem conexão · 3 na fila") a partir do estado real da fila de sincronização.
- [ ] **Moldura 3H** — total mudando de valor: o valor troca de uma vez, sem contagem animada. O fundo vai de transparente para `#FBEDE8` e o texto de `#211E1A` para `#C4472A` em `130ms · ease-out`, com `scale 1→1.06→1`, voltando ao repouso em `430ms · ease-out`. Só dispara em delta ≥ R$ 0,01 originado de ação do usuário.
- [ ] Todas as durações, easings e cores saem de `theme.motion.*` e `theme.colors.*` — nenhum literal em componente ou `.styles.ts`.
- [ ] Com "reduzir movimento" ativo, todas as animações acima vão direto ao estado final, sem deslocamento nem escala; o haptic é mantido.
- [ ] Testes em `frontend/__tests__/` cobrem: haptic `selection` disparado no toque de adicionar item, haptic `success` disparado uma única vez ao atingir "Pronto", banner não aparece antes do debounce de 1,2s, e destaque do total não dispara quando o valor não muda.

## Escopo técnico
- Componentes afetados: `order-card`, `menu-item-card`, `kitchen-status-stepper`, `ui/chip`, `ui/button`, `ui/card`, e a barra de total do detalhe da comanda.
- Referência: protótipo `design-v2.dc.html`, seção 3 (easings e prioridade de implementação) e molduras 3B, 3C, 3D, 3E, 3F, 3H.
- Haptics via `expo-haptics` (adicionar com `npx expo install` se ainda não estiver no projeto); no web o haptic é no-op.

## Fora de escopo
- **Moldura 3A — transição de tela push/pop customizada**: descartada. A nota de prioridade do protótipo manda usar o padrão nativo do stack ("animação própria de navegação custa caro e ninguém percebe").
- **Moldura 3G — pull-to-refresh customizado**: descartado. O protótipo indica usar o `RefreshControl` nativo e classifica o custo/benefício como baixo, já que a lista atualiza sozinha pelo tempo real.
- Escala do chip em 3D, explicitamente marcada como enfeite pelo protótipo.
- Animação de layout compartilhado entre telas.

## Dependências
- HU-49
- HU-51 (o banner de 3F e a pílula de sincronização leem o mesmo estado de fila)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
