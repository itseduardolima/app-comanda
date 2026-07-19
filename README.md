# App do Garçom — gerenciador de comandas

Aplicativo **genérico** de gerenciamento de comandas para restaurantes: o
garçom anota pedidos e acompanha a cozinha direto na mesa, em Android e iOS a
partir de um único código. "Fogo & Brasa" é apenas a marca fictícia do tema de
demonstração — nome, cores e cardápio são configuração.

| Pasta | O quê |
|---|---|
| [`backend/`](backend/) | API NestJS + Prisma + PostgreSQL, tempo real via Socket.IO |
| [`frontend/`](frontend/) | App React Native + Expo (Expo Router, Zustand, offline-first) |
| [`.specs/`](.specs/) | Contrato compartilhado — **fonte da verdade** |
| [`backlog/`](backlog/) | Histórias de usuário por sprint (HU-01 … HU-48) |
| [`CLAUDE.md`](CLAUDE.md) | Guia de entrada para agentes de IA — onde ler cada spec e as regras inegociáveis |

## Subir tudo em dev

```bash
# 1. banco + API
cd backend
docker compose up -d          # PostgreSQL 16
npm install
npx prisma migrate dev && npx prisma db seed
npm run start:dev             # http://localhost:3000/api

# 2. app
cd ../frontend
npm install
npm start                     # Expo Go / simulador (Metro na 8082)
```

Login de demonstração: usuário `demo`, PIN `1234` (ou `joao`/`maria` para o
fluxo de primeiro acesso). Em dispositivo físico, aponte
`frontend/app.json > expo.extra.apiUrl/wsUrl` para o IP da sua máquina.

## Sem pagamento — por design

"Fechar conta" apenas marca a comanda como **Paga** (`payment_status`) com
auditoria de quem fechou. Não há adquirente, Pix, tap-to-pay nem webhook —
fora de escopo do MVP (ver `.specs/00-contexto-projeto.md`).
