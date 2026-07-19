# Brief de design — v2 (estados, animação e telas novas)

> Prompt pronto para colar no [Claude Design](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e).
> Derivado de [`PROXIMOS-PASSOS.md`](PROXIMOS-PASSOS.md) e do estado real do código.

---

## Prompt

Estou evoluindo o **App do Garçom — Fogo & Brasa**, que já existe neste projeto como `App Garcom Fogo e Brasa.dc.html`. O app está implementado em React Native (Expo) e o design atual foi transcrito fielmente: os tokens do código são exatamente os do protótipo.

**Não redesenhe as 14 telas existentes** (00, 00A, 00B, 01, 1A, 1B, 02, 03, 04, 4A–4D). Elas estão implementadas e validadas. O que preciso é do que ficou faltando: **estados** (carregando, vazio, erro, offline), **animação**, e algumas **telas novas**.

Entregue um arquivo novo — `App Garcom Fogo e Brasa v2 - Estados e Telas.dc.html` — no mesmo estilo de canvas do existente: molduras de celular lado a lado, cada uma rotulada com código e nome.

### Sistema de design (use exatamente estes valores, não invente novos)

**Cores**
| Papel | Hex |
|---|---|
| Primária (terracota) | `#C4472A` |
| Primária pressionada | `#9E3319` |
| Primária suave / fundo de destaque | `#FBEDE8` |
| Borda da primária suave | `#E8B3A3` |
| Fundo da tela | `#F7F5F1` |
| Superfície (cards) | `#FFFFFF` |
| Superfície neutra | `#F2EEE7` |
| Texto | `#211E1A` |
| Texto secundário | `#57534C` |
| Texto atenuado | `#8C867C` |
| Texto tênue (etapa não atingida) | `#B4AEA4` |
| Borda | `#EBE6DE` |
| Divisor | `#F1ECE4` |
| Sucesso | `#3B7A57` (suaves `#E4EEE7`, `#F1F6F2`, `#C9E0D1`) |
| Aviso | `#B5711C` (suaves `#F6EBD8`, `#E6D2AC`) |
| Ouro | `#C8A23A` |
| Trilho / track | `#E9E4DB` |

**Tipografia**: Rubik (400/500/600/700). Escala: título 26 bold (−0.6 letter-spacing), heading 20 bold, subtítulo 16 semibold, corpo 14 regular, legenda 12 regular, label 11 semibold uppercase (+1.2 letter-spacing).

**Espaçamento**: 4 / 8 / 16 / 22 / 32 / 48. **Raios**: 10 / 13 / 16 / 18 / pill.

Só modo claro.

**O produto é genérico — isto é o requisito mais importante deste brief.** "Fogo & Brasa" é uma marca fictícia de demonstração. O mesmo app precisa servir uma hamburgueria, um bar, uma pizzaria, uma cafeteria ou um restaurante por quilo, trocando só o tema. Portanto:

- Nome e monograma são **dados**, nunca elemento fixo de layout.
- **Nenhuma ilustração, ícone ou copy pode assumir um tipo de comida.** Nada de brasa, grelha, espeto, picanha. O domínio é *comanda*, não churrasco: mesa, comanda, pedido, ticket, salão, conta.
- Itens de exemplo devem ser variados e neutros ("1× Prato do dia", "2× Suco natural"), não um cardápio de churrascaria.

### Restrições técnicas (importante — tudo será implementado em React Native)

- **SVG**: pode usar, é o que eu quero para as ilustrações. Mas mantenha simples — `path`, `circle`, `rect`, `g`, cores sólidas. **Sem** filtros, máscaras, `feGaussianBlur` ou gradiente de malha: será portado para `react-native-svg`.
- **Gradientes**: evite. Só valem se forem lineares e realmente necessários (exigem dependência extra). Prefira cor sólida.
- **Animação**: será implementada com Reanimated. Para cada animação, especifique **duração em ms, easing e o que exatamente interpola** (opacidade, translateY, escala, largura). Nada que dependa de CSS puro (`filter`, `backdrop-filter`, keyframes complexos).
- **Sombra**: no máximo uma sombra suave e uniforme por elevação. Sem sombras múltiplas ou coloridas.
- Alvos de toque grandes: o app é usado em pé, com uma mão, às vezes com a tela suja.

### Responsividade — não desenhe só o caso feliz

Vi telas apertadas na primeira rodada. O celular do garçom não é o seu aparelho de referência: é o mais barato que a casa comprou, às vezes com a fonte do sistema aumentada porque quem usa tem 50 anos.

Para cada tela densa (comanda, cardápio, KDS, lista de comandas), mostre **também o caso apertado**, lado a lado com o confortável:

- **Largura mínima 320pt** (iPhone SE) além da largura padrão. Se algo quebra, o desenho está errado — não o aparelho.
- **Texto longo real**: nome de item com 40+ caracteres, nome de cliente comprido, `R$ 1.234,56`, quantidade `12×`. Diga o que trunca, o que quebra linha e o que nunca pode encolher (valor e status nunca).
- **Fonte do sistema ampliada** (~130%): o que reflui e o que vira scroll.
- **Tablet**: o app roda esticado. Diga se vira duas colunas ou se ganha margem lateral com largura máxima.
- **Rotação**: o KDS é paisagem; o resto é retrato. Se o garçom girar, o que acontece?

Prefira layout que **reflui** a layout que depende de caber. Truncar com reticências é decisão de design — diga onde é aceitável e onde é proibido.

---

### 1. Estados de carregamento

Hoje o app mostra só um texto "Carregando…". Quero **skeletons** que tenham a forma do conteúdo real:

- **1A** Skeleton da lista de Comandas (3 cards, com as faixas de mesa, cliente, status e valor)
- **1B** Skeleton do Cardápio (chips de categoria + 4 linhas de item com miniatura)
- **1C** Skeleton do Detalhe da comanda (itens + barra de total)
- **1D** Skeleton do ticket de cozinha (cabeçalho do ticket + stepper + itens)

Especifique a animação de shimmer: direção, duração, easing e as duas cores do gradiente de varredura (dentro da paleta — provavelmente `#F2EEE7` → `#EBE6DE`).

- **1E** Botão em estado de carregamento (as 3 variantes: primário, secundário, ghost)
- **1F** Indicador de "sincronizando" discreto, para quando a fila offline está drenando

### 2. Estados vazios com ilustração SVG

É o que mais sinto falta. Hoje são frases secas centralizadas. Quero ilustração + título + subtítulo + ação, com personalidade — mas personalidade **de serviço de salão**, não de um tipo de cozinha.

- **2A** Nenhuma comanda aberta (é o estado mais visto do dia — merece ser o mais caprichado)
- **2B** Nenhuma comanda paga ainda
- **2C** Categoria do cardápio sem itens
- **2D** Comanda sem itens ("toque em Adicionar para começar")
- **2E** Nenhum ticket na cozinha
- **2F** Sem conexão, com N alterações aguardando envio — deve transmitir "está tudo salvo, só não sincronizou ainda", não alarme
- **2G** Falha ao carregar, com botão de tentar novamente

Para as ilustrações: monocromáticas ou de 2 cores da paleta, traço de ~1.7px como os ícones existentes, altura de ~120–160px.

Motivos que servem a qualquer restaurante: comanda/ticket, mesa vista de cima, cadeiras, bandeja, sino de balcão, prato genérico sem conteúdo identificável. **Não** use nada que identifique um tipo de cozinha. Evite mascote e evite a "caixa vazia" genérica.

### 3. Animações e microinterações

Liste como uma especificação implementável, não como enfeite:

- **3A** Transição entre telas (push/pop da navegação)
- **3B** Item entrando na comanda depois do "+" — precisa dar a sensação de que caiu na lista
- **3C** Mudança de status na cozinha: o stepper avançando de etapa, e o badge do item trocando de cor
- **3D** Seleção de chip de categoria
- **3E** Pressionado dos cards e botões (hoje é só troca de cor)
- **3F** Entrada e saída do banner de "reconectando"
- **3G** Pull-to-refresh na lista de comandas
- **3H** Total da comanda mudando de valor (contagem ou destaque momentâneo?)

Para cada uma: duração, easing e propriedade animada. Se alguma não valer a pena, diga — prefiro 5 boas a 8 medianas.

### 4. Confirmação (substitui o alerta nativo)

O app usa o `Alert` nativo, que ignora o design e **não funciona na web**. Quero um componente próprio:

- **4A** Confirmação destrutiva — "Fechar conta · R$ 63,00" (mostrando o total, porque é irreversível)
- **4B** Confirmação neutra — "Sair da conta"
- **4C** Confirmação de remover item

Bottom sheet ou diálogo centralizado? Escolha e justifique — o app é de uma mão só, o que pesa a favor do bottom sheet. Especifique a animação de entrada e o comportamento do backdrop.

### 5. Feedback efêmero (toast)

- **5A** "Item adicionado à comanda"
- **5B** "Sem conexão — será enviado quando voltar"
- **5C** Erro de ação, com "tentar novamente"

Posição, duração, empilhamento e animação.

### 6. Telas novas

**6A — KDS (Display de Cozinha), tablet em paisagem.** É a tela mais importante desta rodada. Hoje o status da cozinha só muda se alguém tocar no celular do garçom, o que não acontece numa cozinha real.

Colunas por estágio (Na fila / Preparando / Pronto), cada ticket como cartão com número, mesa, tempo decorrido e itens. Precisa ser legível **a 2 metros de distância**, por alguém com as mãos ocupadas. Pense em: hierarquia de tempo (ticket velho precisa gritar), toque grande para avançar estágio, e o que acontece quando há mais tickets do que cabem na tela.

**6B — Lista de comandas com recorte temporal.** Hoje o filtro "Todas" traz o histórico inteiro, o que não escala. Preciso do desenho de: seletor de período (hoje / ontem / últimos 7 dias), carregamento incremental ao rolar, e o indicador de que há mais.

**6C — Estados de erro de servidor.** API fora do ar, sessão expirada, e versão do app desatualizada. Três telas irmãs.

> **Fora de escopo: turnos.** Não desenhe fechamento de turno, relatório de turno nem filtro por turno. O recorte de tempo do produto é o **dia**, não o turno — o app não tem noção de abertura/fechamento de expediente, e não vai ter.

### 7. Se sobrar espaço

- Modo escuro do KDS (cozinha costuma ter iluminação forte e vapor; talvez o contrário seja melhor — me diga o que faz sentido)
- Skeleton vs. spinner: onde cada um cabe

---

### Nada de clichê de interface gerada por IA

Este é um critério de reprovação, não uma preferência. O protótipo existente tem uma linguagem própria e sóbria; siga ela, não o visual padrão de dashboard.

Proibido:

- **Barra de acento colorida na lateral do card.** O protótipo tem zero `border-left` — status se comunica por badge e por cor de texto, que é a linguagem já estabelecida.
- Pílula "AO VIVO" com pontinho pulsando.
- Card dentro de card dentro de card.
- Ícone decorativo ao lado de todo título.
- Emoji como ilustração.
- Gradiente, glassmorphism, sombra colorida, brilho.
- Uppercase com letter-spacing exagerado fora do token `label` que já existe.
- Números gigantes sem função, "métrica" que ninguém pediu.
- Ilustração de estoque genérica — caixa vazia, prancheta, lupa, foguete.

Antes de entregar, olhe cada tela e pergunte: *isto existe porque o garçom precisa, ou porque enche o espaço?* Se for a segunda, tire.

### O que me entregar

1. O arquivo `.dc.html` com as telas e componentes acima, rotulados.
2. Para cada animação, a especificação numérica (duração, easing, propriedade).
3. Os SVGs limpos o suficiente para eu portar direto.
4. Uma nota curta do que você **não** faria — se algum pedido acima for supérfluo ou conflitar com o uso real (garçom em pé, salão barulhento, mão ocupada), diga. Prefiro cortar do que implementar enfeite.
