# 02 · Organização de pastas do backend

> Árvore de referência para o scaffold do backend (Sprint 3 / Fase 3). Convenções de nome valem para todo código novo.

```
backend/
  .specs/                          # este diretório (specs internas do backend)
  prisma/
    schema.prisma                  # fonte da verdade do modelo — espelha .specs/02-modelo-de-dados.md
    migrations/                    # geradas por `prisma migrate dev`, versionadas
  src/
    main.ts                        # bootstrap Nest, ValidationPipe global, CORS
    app.module.ts                  # importa todos os módulos de domínio

    prisma/
      prisma.module.ts             # @Global(), exporta PrismaService
      prisma.service.ts            # extends PrismaClient, OnModuleInit/OnModuleDestroy

    auth/
      auth.module.ts
      auth.controller.ts           # POST /auth/login, /auth/pin/create, /auth/pin/verify
      auth.service.ts
      dto/
        login.dto.ts
        create-pin.dto.ts
        verify-pin.dto.ts
      strategies/
        jwt.strategy.ts
      guards/
        jwt-auth.guard.ts          # guard REST global
        ws-jwt.guard.ts            # guard do handshake do WebSocket
      decorators/
        public.decorator.ts        # @Public() — libera rota do JwtAuthGuard global
        current-operator.decorator.ts

    orders/
      orders.module.ts
      orders.controller.ts         # /orders (CRUD), /orders/:id/close, /orders/:id/send-to-kitchen
      orders.service.ts
      dto/
        create-order.dto.ts
        add-order-item.dto.ts
        update-order-item.dto.ts

    menu/
      menu.module.ts
      menu.controller.ts           # /menu, /menu/categories
      menu.service.ts

    tables/
      tables.module.ts
      tables.controller.ts         # /tables, /tables/:id/orders
      tables.service.ts

    kitchen/
      kitchen.module.ts
      kitchen.controller.ts        # PATCH /kitchen/items/:itemId, GET /kitchen/tickets
      kitchen.service.ts
      kitchen.gateway.ts           # @WebSocketGateway() — difunde eventos, não recebe escrita
      dto/
        update-kitchen-status.dto.ts

    common/
      filters/
        http-exception.filter.ts   # formato { statusCode, message, error }
      pipes/
      decorators/
      types/

  test/
    <dominio>.e2e-spec.ts          # e2e por módulo (Supertest)

  .env.example
  package.json
  tsconfig.json
```

## Convenções de nome

| Tipo | Convenção | Exemplo |
|---|---|---|
| Arquivo | kebab-case + sufixo do tipo Nest | `orders.service.ts`, `create-order.dto.ts` |
| Classe | PascalCase | `OrdersService`, `CreateOrderDto` |
| Teste de unidade | `<arquivo>.spec.ts` ao lado do arquivo testado | `orders.service.spec.ts` |
| Teste e2e | `<dominio>.e2e-spec.ts` em `test/` | `orders.e2e-spec.ts` |
| Variável/função | camelCase, inglês | `closeOrder`, `kitchenStatus` |
| Enum/coluna de banco | snake_case (Prisma/Postgres), mapeado para camelCase no client | `payment_status` → `paymentStatus` |

## Regras

- Um arquivo = uma classe/responsabilidade. Não acumular DTOs de módulos diferentes no mesmo arquivo.
- `dto/` só contém classes de validação de entrada — tipos de saída/retorno ficam inferidos do Prisma Client ou em `common/types/` se precisarem ser compartilhados entre módulos.
- Nada em `src/` acessa `PrismaClient` diretamente — sempre `PrismaService` injetado.
- Novo domínio de negócio = nova pasta em `src/` com a mesma anatomia acima, adicionada ao índice de módulos em `../../.specs/01-arquitetura.md` (raiz) e neste documento.
