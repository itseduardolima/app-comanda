# HU-54 · Toast de feedback efêmero

**Sprint:** 7 — Estados e movimento
**Épico:** Experiência de uso
**Camada:** Frontend
**Story points:** 5

## História de usuário
Como **garçom**, quero **uma confirmação curta e discreta de que a ação deu certo (ou não)**, para que **eu siga anotando sem parar para fechar aviso, e sem perder de vista o botão principal da tela**.

## Critérios de aceite
- [ ] Componente `Toast` em `src/components/toast/` com sibling de estilos, mais um provider global montado em `app/_layout.tsx` e um hook `useToast()` para disparo a partir de qualquer tela.
- [ ] Posição: acima do rodapé de ação, com 12px de folga; nunca no topo da tela e nunca cobrindo o botão primário (seção 5).
- [ ] Fundo `theme.colors.text` (`#211E1A`) nas três variantes; a diferenciação fica no ícone, não na cor do fundo (moldura 5A).
- [ ] Entrada: `translateY 16→0` + `opacity 0→1` em `200ms · ease-out`; saída em `160ms · ease-in` (seção 5).
- [ ] Duração: 2,4s para informativo, 4s para toast com ação; o toast de offline permanece até o estado mudar (seção 5).
- [ ] Empilhamento: no máximo 2 visíveis; o mais novo entra por baixo e empurra o anterior 4px para cima, que recua para `opacity .55 / scale .97`; o terceiro substitui o mais antigo (seção 5, moldura 5C).
- [ ] Toast com ação nunca é substituído automaticamente por um toast informativo (seção 5, moldura 5C).
- [ ] **Moldura 5A** — item adicionado: título "Item adicionado", detalhe "1× <item> · <cliente>", duração 2,4s.
- [ ] **Moldura 5B** — sem conexão: aparece **uma vez por queda de conexão**, não a cada item adicionado; depois disso quem informa é o banner persistente da moldura 3F.
- [ ] **Moldura 5C** — erro de ação: título "Não deu para enviar", detalhe "A cozinha não recebeu o ticket", ação "Tentar" e duração 4s.
- [ ] Todos os textos vêm de `src/i18n/pt-BR.ts`; o toast expõe `accessibilityLiveRegion="polite"` (Android) e anúncio equivalente no iOS.
- [ ] Com "reduzir movimento" ativo, o toast aparece e some sem deslocamento, apenas com opacidade.
- [ ] Testes em `frontend/__tests__/` cobrem: no máximo 2 toasts visíveis, toast com ação não é substituído por informativo, e o toast de offline dispara uma única vez em quedas repetidas de conexão.

## Escopo técnico
- Referência: protótipo [`App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html`](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html), seção 5 e molduras 5A–5C.
- Disparos iniciais: adicionar item ao pedido, queda de conexão detectada pelo hook de rede, falha ao enviar à cozinha.
- Estilos exclusivamente em `*.styles.ts` via `createStyles`.

## Fora de escopo
- Toast com "Desfazer" para remoção de item — a remoção continua pela folha de confirmação (HU-53).
- Notificação push ou fora do app.
- Fila de toasts persistida entre sessões.
- Banner persistente de reconexão (moldura 3F, em HU-55).

## Dependências
- HU-49
- HU-53 (provider global no `_layout.tsx`, para não haver duas árvores de overlay concorrentes)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
