# 04 · Fluxos principais

## 4.1 Autenticação do operador

```
Abrir app → Login (usuário)
  → 1º acesso: Criar PIN (4 dígitos, confirma) → entra
  → acessos seguintes: digitar PIN → entra
  (opção "Trocar" usuário na tela de PIN)
```

Telas: `00 Login`, `00A Criar PIN`, `00B Acesso rápido por PIN`.
API: `POST /auth/login` → `POST /auth/pin/create` (1º acesso) ou `POST /auth/pin/verify`.

## 4.2 Fluxo de comanda (salão)

```
Comandas → Nova comanda → escolhe Mesa / Balcão-Retirada / Delivery
  → (se Mesa) Escolher mesa livre → abre a comanda (nome opcional)
  → Anotar pedido (Cardápio) → adiciona item(ns)
  → personaliza item (opcional: retirar/adicionar/ponto/observação)
  → Ver comanda (tela 04) → Enviar para cozinha
  → acompanha status: Enviado → Em preparo → Pronto → Entregue
```

Regras:
- **Múltiplas comandas por mesa**: mesma mesa pode ter comandas separadas por pessoa (João, Maria).
- **Status por item**: cada item tem seu próprio `kitchen_status`, além do status geral da comanda.
- Cada envio à cozinha gera um **ticket** (`kitchen_ticket`, ex.: `#1404`).

Telas: `1A Nova comanda`, `1B Escolher mesa`, `02 Cardápio`, `03 Personalizar item`, `04 Detalhe da comanda`.

## 4.3 Fechamento (marcar como pago — sem processar pagamento)

```
Comanda entregue → tela 04 mostra total → "Fechar conta"
  → comanda muda de "A pagar" para "Pago" (registro de status)
  → some da aba Abertas, aparece em Pagas
  (o pagamento em si acontece por fora: maquininha avulsa / Pix / dinheiro)
```

- Sem webhook, cobrança ou reconciliação. "Pago" é flag manual.
- API: `POST /orders/:id/close`.
- Recomendado: confirmação antes de fechar; registrar operador que fechou.

## 4.4 Status de cozinha (tempo real via WebSocket)

- **WebSocket**: o app se conecta ao Gateway e se inscreve (ex.: por comanda/mesa). Quando um item muda de status, o backend **empurra** o evento e a tela atualiza sem re-consultar.
- Transições do item: `queued → preparing → ready → delivered`.
- Eventos WS: ver `03-api-contrato.md` (`item.status.changed`, `order.updated`, `kitchen.ticket.created`).
- **Ressincronização**: ao (re)conectar, o app faz um `GET` REST para carregar o baseline; o WS entrega os deltas dali em diante. Se o socket cair, reconecta e ressincroniza.
- Tela `4D Entregue`: se comanda ainda `unpaid`, mostra "Comanda ainda não paga".
