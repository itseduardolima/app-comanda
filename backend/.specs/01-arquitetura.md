# 01 · Arquitetura interna do backend

> Como o código dentro de `backend/src/` é organizado. Para o desenho de alto nível (REST + WS entre app e backend), ver [`../../.specs/01-arquitetura.md`](../../.specs/01-arquitetura.md).

## Camadas (por módulo)

```
Controller (HTTP)  →  Service (regra de negócio)  →  PrismaService (acesso a dados)
```

- **Controller**: só mapeia rota HTTP ↔ DTO ↔ chamada de service. **Sem regra de negócio.** Não acessa Prisma diretamente.
- **Service**: contém toda a regra de negócio (ex.: `OrdersService.closeOrder` decide o que significa fechar uma comanda). Injeta `PrismaService` e outros services que precisar (ex.: `OrdersService` pode injetar `KitchenGateway` para emitir `order.updated`).
- **PrismaService**: único ponto de acesso ao banco. Nunca instanciar `new PrismaClient()` fora dele — sempre injetar `PrismaService`.

Um controller pode injetar apenas o service do seu próprio módulo. Comunicação entre módulos acontece **service → service** (import do módulo correspondente), nunca controller → service de outro módulo.

## Um módulo Nest por domínio

`AuthModule`, `OrdersModule`, `MenuModule`, `TablesModule`, `KitchenModule` — cada um com a mesma anatomia:

```
<dominio>/
  <dominio>.module.ts
  <dominio>.controller.ts
  <dominio>.service.ts
  dto/
    <acao>.dto.ts
```

Módulos compartilhados (sem controller — não são domínio de negócio, são infraestrutura):
- `prisma/` — `PrismaModule` + `PrismaService` (global, injetável em qualquer módulo).
- `common/` — filtros de exceção, pipes, decorators e tipos usados por mais de um módulo.

`KitchenModule` é o único com uma peça a mais: `kitchen.gateway.ts` (WebSocket Gateway — ver seção própria abaixo).

## Injeção de dependência

- Sempre via construtor (`constructor(private readonly ordersService: OrdersService) {}`).
- Nada de singleton manual ou import direto de instância — o container do Nest resolve o ciclo de vida.
- `PrismaService` é `@Global()` dentro do seu módulo para não precisar reimportar `PrismaModule` em cada domínio.

## DTOs e validação

- Toda entrada de request (`@Body()`, `@Query()`, `@Param()` sensível) é tipada como uma classe DTO decorada com `class-validator`.
- `ValidationPipe` global em `main.ts` com `whitelist: true, forbidNonWhitelisted: true, transform: true` — corpo com campo a mais é rejeitado, nunca silenciosamente ignorado ou aceito.
- Nunca ler `req.body` cru dentro de um service.

## Erros

- Erros de negócio usam as exceções nativas do Nest: `NotFoundException` (ex.: comanda inexistente), `UnauthorizedException` (PIN inválido), `BadRequestException`, `ConflictException` (ex.: tentar reabrir mesa com comanda ainda aberta).
- Um `HttpExceptionFilter` global (`common/filters/`) garante que toda resposta de erro siga o formato `{ statusCode, message, error }` do `../../.specs/03-api-contrato.md`.
- Nunca deixar uma exceção não tratada vazar stack trace para o cliente.

## Autenticação (JWT)

- `@nestjs/passport` + estratégia JWT (`auth/strategies/jwt.strategy.ts`) valida o token e injeta o operador autenticado em `request.user`.
- `JwtAuthGuard` é aplicado **globalmente** (`APP_GUARD` em `app.module.ts`); rotas públicas (`/auth/login`, `/auth/pin/create`, `/auth/pin/verify`) usam um decorator `@Public()` que o guard respeita.
- Decorator `@CurrentOperator()` extrai o operador autenticado do request nos controllers, em vez de reler `request.user` manualmente em cada handler.

## WebSocket Gateway (tempo real de cozinha)

- `KitchenGateway` vive dentro de `kitchen/` mas é uma peça separada do `KitchenController` — o Gateway **nunca recebe escritas**, só difunde eventos quando um service (`OrdersService`, `KitchenService`) muda algo.
- Autenticação do socket: `WsJwtGuard` (mesmo JWT do REST) validado no handshake (`common/guards/` ou `auth/guards/`, reaproveitando a mesma estratégia).
- Rooms: cliente entra em `order:<id>` e/ou `table:<id>` via evento `subscribe`. O Gateway emite `item.status.changed`, `order.updated`, `kitchen.ticket.created` para a room correspondente — nunca faz broadcast global.
- Regra de ouro (já fechada em `../../.specs/03-api-contrato.md`): mutações **sempre** passam pelo REST (validação via DTO); o Gateway é só o canal de notificação de quem já mutou os dados.

## Prisma

- `prisma/schema.prisma` é a fonte da verdade executável do modelo de dados — espelha `../../.specs/02-modelo-de-dados.md`.
- Migrations geradas com `prisma migrate dev` e versionadas em `prisma/migrations/`. Nunca editar o schema do banco fora de uma migration.
- `PrismaService extends PrismaClient` e implementa `OnModuleInit`/`OnModuleDestroy` para abrir/fechar a conexão junto com o ciclo de vida do Nest.

## Configuração

- Variáveis de ambiente via `@nestjs/config`, validadas na inicialização (schema de validação, ex. com `Joi`) — o processo falha ao subir se faltar `DATABASE_URL` ou `JWT_SECRET`, em vez de falhar silenciosamente na primeira request.

## Testes

- **Unidade**: services, com `PrismaService` mockado (Jest). Um `*.service.spec.ts` ao lado do service.
- **E2E**: controllers, com Supertest contra um banco de teste real (não mock) — garante que o contrato HTTP (`03-api-contrato.md`) está correto ponta a ponta. Vivem em `test/`.
- Todo bug corrigido ganha um teste de regressão (ver DoD em `../../.specs/05-padroes-de-codigo.md`).
