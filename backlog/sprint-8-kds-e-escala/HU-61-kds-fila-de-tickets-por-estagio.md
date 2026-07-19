# HU-61 · KDS: fila de tickets por estágio

**Sprint:** 8 — KDS e escala
**Épico:** Display de Cozinha (KDS)
**Camada:** Frontend
**Story points:** 8

## História de usuário
Como **cozinheiro**, quero **ver na parede a fila de tickets separada por estágio, com o tempo de cada um bem visível**, para que **eu saiba de longe o que está atrasado sem pegar o celular de ninguém**.

## Critérios de aceite
- [ ] Nova superfície KDS para **tablet 10" em paisagem travada (1280×800)**, com três colunas — **Na fila · Preparando · Pronto · servir** — e o contador de tickets em cada cabeçalho, conforme moldura 6A.
- [ ] Cabeçalho fixo com o nome do estabelecimento (tema configurável), "N tickets abertos", "N atrasados", hora corrente e hora do último ticket recebido; rodapé mostra "Servidos hoje · N".
- [ ] O cartão de ticket traz: número (`#1404`), origem (`Mesa 07 · João` ou `Balcão · #12`), cronômetro, linhas `Nx nome do item` e destaque das observações/modificadores (ex.: "Sem cebola · alergia") — a observação nunca é truncada nem escondida.
- [ ] **Hierarquia de tempo (moldura 6A):** o cronômetro é o segundo maior elemento do cartão (26px bold, numeral tabular), atrás só do número do ticket.
- [ ] Faixas de tempo redundantes em **cor e palavra**: 0–5 min neutro; 5–12 min âmbar com rótulo "atenção"; acima de 12 min vermelho com rótulo **"atrasado"** — nunca só cor, porque nem todo cozinheiro distingue as duas.
- [ ] O cronômetro conta a partir do envio do ticket para a cozinha e atualiza sozinho pelo menos a cada 30s, sem recarregar a lista.
- [ ] **Um botão por cartão**, largura total e **56px de altura**, com o rótulo do próximo estágio ("Iniciar preparo", "Marcar pronto"). Sem swipe, sem long-press, sem arrastar entre colunas.
- [ ] Ordenação **FIFO por hora de envio**: os mais velhos no topo. A coluna **não rola sozinha**; o excedente vira a barra tocável "↓ mais N na fila", que avança uma página.
- [ ] Acima de 8 tickets numa coluna, os cartões abaixo do terceiro **colapsam para uma linha** (número + mesa + tempo) — resumo, não sumiço.
- [ ] Tema **claro obrigatório** (fundo claro, texto quase preto): não existe modo escuro no KDS — cozinha é ambiente de luz forte, e a recomendação da moldura 6A é explícita. A tela é mantida **sempre ligada** e o brilho no máximo.
- [ ] Se o tablet for girado para retrato, degrada para **uma coluna por vez com seletor de estágio no topo** — degradação assumida, não layout de primeira classe.
- [ ] A fila é carregada de `GET /api/kitchen/tickets` filtrando o **dia corrente** e os estágios pendentes; tickets totalmente entregues saem das colunas e só contam em "Servidos hoje".
- [ ] O KDS autentica com o **token de dispositivo** (HU-60); não há tela de login por usuário e PIN nesta superfície.
- [ ] Testes de componente cobrem: faixas de tempo (limites 5 e 12 min), colapso acima de 8 tickets, barra "↓ mais N" paginando e ausência de qualquer interação por gesto.

## Escopo técnico
- `GET /api/kitchen/tickets` hoje só aceita `orderId`; a fila do KDS precisa de recorte por dia/estágio — ajuste de contrato coordenado com HU-62 e registrado em `.specs/03-api-contrato.md`.
- Reaproveitar tokens e componentes existentes (`kitchen-status-stepper`, `card`, `badge`) com uma escala própria de KDS (leitura a 2 m), sem estilo inline.
- Referências: moldura 6A do protótipo v2; moldura 8E (KDS em paisagem travada); `PROXIMOS-PASSOS.md` § "A cozinha não tem tela".

## Fora de escopo
- **"Chamar garçom"** (desenhado tracejado na moldura 6A como proposta): exigiria push, registro de device token e a noção de "garçom responsável pela mesa", que o modelo de dados não tem. Sem push, o aviso só apareceria para quem já estivesse olhando o app — inútil. Não entra neste sprint.
- Modo escuro do KDS — decisão de produto contra, registrada na moldura 6A.
- Impressora térmica de comanda como alternativa ao KDS.
- Roteamento de item por estação (quente/frio/bar).

## Dependências
- HU-60 (acesso do dispositivo de cozinha), HU-31 (gateway WebSocket), HU-29 (send-to-kitchen)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
