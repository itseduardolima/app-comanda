# HU-59 · App: telas de erro de servidor

**Sprint:** 8 — KDS e escala
**Épico:** Resiliência do App
**Camada:** Frontend
**Story points:** 3

## História de usuário
Como **garçom**, quero **que o app me diga claramente quando o problema é do sistema, quando minha sessão venceu e quando preciso atualizar**, para que **eu não perca tempo reiniciando o celular no meio do salão nem ache que meu trabalho sumiu**.

## Critérios de aceite
- [ ] **Servidor fora do ar (moldura 6C·1):** resposta `5xx` ou falha de rede repetida abre uma tela com o título "O sistema está fora do ar" e o texto explícito de que **não é o aparelho do garçom**; ação primária é **"Continuar offline"** e a secundária é **"Tentar agora"** — nunca o contrário.
- [ ] Nessa tela, a reconexão é automática a cada **15 segundos**, com rodapé técnico mostrando o código e o contador ("HTTP 503 · próxima tentativa em 12s"); "Tentar agora" reinicia o contador imediatamente.
- [ ] "Continuar offline" fecha a tela e devolve o garçom ao fluxo normal, com a fila de sincronização ativa — anotar pedido continua funcionando e sobe quando voltar.
- [ ] **Sessão expirada (moldura 6C·2):** resposta `401` em qualquer requisição autenticada abre a tela "Sua sessão expirou", explicando a validade de **12h**, com a ação primária **"Digitar PIN"** (4 toques) e a secundária **"Entrar com outro usuário"**.
- [ ] A tela de sessão expirada informa explicitamente que **nada foi perdido**, citando o que continua no aparelho (ex.: "1 comanda aberta continua no aparelho"), e o rodapé identifica a sessão encerrada (usuário e hora).
- [ ] Reautenticar por PIN **volta para a tela onde o garçom estava**, não para a home; a fila de sincronização é retomada com o novo token, sem descartar mutações pendentes.
- [ ] Reautenticação nunca pede usuário + senha — o único caminho é PIN, ou trocar de usuário pelo fluxo de login existente.
- [ ] **Versão desatualizada (moldura 6C·3):** o app trata um código dedicado do servidor (ex.: `426`/erro `app_version_unsupported`) abrindo a tela "Atualize o app", mostrando **versão atual vs. versão necessária** e um único botão "Atualizar agora".
- [ ] A tela de versão desatualizada é **bloqueante, sem saída secundária** — não há "adiar", não há botão de voltar, e o gesto de voltar do sistema não a fecha.
- [ ] Antes de bloquear, o app **drena a fila de sincronização** e informa quantas alterações estão pendentes ("Você tem 2 alterações na fila. Elas serão enviadas antes de atualizar."); só bloqueia depois de enviar o que dava para enviar.
- [ ] As três telas são componentes reutilizáveis com o mesmo layout (ícone, título, explicação, ações), usando tokens do tema e i18n em `pt-BR`, sem estilo inline.
- [ ] Testes cobrem: `5xx` abrindo 6C·1 e "Continuar offline" preservando a fila; `401` abrindo 6C·2 e o retorno à tela de origem após o PIN; erro de versão abrindo 6C·3 sem rota de saída.

## Escopo técnico
- Ponto natural de acionamento: o interceptor/cliente HTTP em `frontend/src/api/` e o cliente WebSocket, sinalizando um estado global de erro para o `_layout` renderizar a tela por cima.
- Referências: molduras 6C·1, 6C·2 e 6C·3 do [protótipo v2](https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html); `PROXIMOS-PASSOS.md` § Tier 1 (`Alert` do React Native não funciona na web — estas telas são componentes próprios, não `Alert`).

## Fora de escopo
- Forçar a atualização por si só (download/instalação do binário) — o botão apenas abre a loja / o canal de update configurado.
- Sentry / relato automático de erro (HU-48).
- Lockout de PIN e rate limit no backend.

## Dependências
- HU-33 (reconexão e ressincronização), HU-28 (fila offline), HU-16 (acesso rápido por PIN), HU-18 (persistência de sessão JWT)

## Definition of Done
- [ ] Código em inglês, UI via i18n
- [ ] Tipos (`tsc`) e lint OK
- [ ] Testes relevantes passando
- [ ] Spec em `.specs/` atualizada, se o comportamento mudou
- [ ] Nenhuma lógica de pagamento/cobrança introduzida
