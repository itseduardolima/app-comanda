# 00 · Contexto do projeto

## O produto

**App do Garçom** — um aplicativo **genérico de gerenciamento de comandas** para restaurantes. Serve o garçom para **anotar pedidos e acompanhar a cozinha direto na mesa**, rodando em **Android e iOS a partir de um único código-fonte**.

> **"Fogo & Brasa" é um nome genérico de exemplo**, usado apenas no protótipo de referência (tema/marca fictícia de uma churrascaria). O produto **não é específico** para esse restaurante — a marca (nome, cores, cardápio) deve ser tratada como **configuração/tema**, não como algo fixo no código.

Origem do produto: protótipo de telas em `App Garcom Fogo e Brasa.dc.html` (validação de UX — Fase 0, concluída).

O protótipo vive no Claude Design e é a **fonte da verdade visual** — divergência entre app e protótipo é bug do app:

- Projeto: <https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e>
- v1 — telas do MVP: <https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa.dc.html>
- v2 — estados, movimento e telas novas (sprints 7 e 8): <https://claude.ai/design/p/0edee1ad-dd7e-41e4-b6a3-82d027c7bc6e?file=App+Garcom+Fogo+e+Brasa+v2+-+Estados+e+Telas.dc.html>

Como consultá-lo e como transcrever um valor novo para token: [`frontend/.specs/03-estilos.md` § Fonte do design](../frontend/.specs/03-estilos.md#fonte-do-design).

## O que o app faz (escopo do MVP)

- **Login do operador** (garçom) por usuário + PIN de 4 dígitos.
- **Abrir e organizar comandas** por Mesa / Balcão-Retirada / Delivery.
- **Múltiplas comandas por mesa** (ex.: Mesa 07 → João, Maria) para conta dividida.
- **Anotar pedido** a partir do cardápio (categorias + itens).
- **Personalizar item**: retirar/adicionar ingredientes, ponto da carne, observação.
- **Acompanhar cozinha** com status **por item**: Na fila → Preparando → Pronto → Entregue.
- Cada envio à cozinha gera um **ticket** (ex.: `#1404`).
- **Fechar conta**: marca a comanda como **Paga** (apenas troca de status).

Navegação inferior do app (tab bar): **Comandas · Cardápio · Vendas · Perfil**.

## O que está FORA de escopo (não implementar no MVP)

- ❌ Processamento de pagamento — cartão, Pix, tap-to-pay, adquirente, InfinitePay.
- ❌ Webhook / reconciliação / id de cobrança externa.
- ❌ Emissão de nota fiscal e impressão certificada.
- ❌ Telas de pagamento (as antigas `05 Pagamento` / `06 Aprovada` / `07 Recusada` foram removidas).

> "Pago" é um **flag manual**: ao "Fechar conta", `payment_status` vai de `unpaid` → `paid`. O pagamento real acontece por fora (maquininha avulsa, Pix, dinheiro).

## Telas do MVP

| # | Tela | Função |
|---|------|--------|
| 00 | Login | Entrar com usuário do operador |
| 00A | Criar PIN · 1º acesso | Operador define PIN de 4 dígitos |
| 00B | Acesso rápido por PIN | Nos próximos acessos, só o PIN |
| 01 | Comandas | Lista com filtros Abertas / Pagas / Todas |
| 1A | Nova comanda | Tipo (Mesa / Balcão-Retirada / Delivery) + nome opcional |
| 1B | Escolher mesa | Grid Livre / Ocupada |
| 02 | Anotar pedido (Cardápio) | Categorias + itens, "Ver comanda" |
| 03 | Personalizar item | Retirar/adicionar, ponto da carne, observação |
| 04 | Detalhe da comanda | Itens com status individual; "Adicionar" e "Fechar conta" |
| 4A | Enviado à cozinha | Ticket + stepper Enviado → Preparo → Pronto → Entregue |
| 4B | Em preparo | Itens "na chapa", tempo decorrido |
| 4C | Pronto | Itens prontos, "Marcar como entregue" |
| 4D | Entregue | Se ainda não paga, mostra "Comanda ainda não paga" |

## Riscos / pontos em aberto

- **Publicação nas lojas**: iOS exige conta Apple Developer (US$ 99/ano) e revisão mais rígida.
- **Múltiplas comandas por mesa**: ✅ regra de liberação decidida (HU-41): mesa só volta a Livre quando **todas** as comandas dela estiverem pagas (ver `02-modelo-de-dados.md`). Divisão de itens entre comandas e total agregado da mesa seguem em aberto.
- **Segurança do PIN**: 4 dígitos é fraco — política de bloqueio após N tentativas, quem pode fechar conta.
- **Sincronização offline**: política de conflito quando dois garçons editam a mesma comanda offline.
- **Fechar conta = registro manual**: confirmação antes de fechar, log de qual operador fechou.
