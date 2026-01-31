# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

**Development:**
```bash
npm run dev        # Start dev server with hot reload (watches src/index.ts)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled server (requires build first)
npm run lint       # TypeScript type checking without emitting files
```

**Database (Local Development):**
```bash
cd database && docker-compose -f docker-compose.yml up    # Start PostgreSQL only
```

**Docker (Full Stack):**
```bash
docker-compose up --build         # Build and run app + database
docker-compose logs -f app        # View app logs
docker-compose down               # Stop all services
```

**See [DOCKER.md](DOCKER.md) for comprehensive Docker documentation.**

## Project Overview

This is a **Production-ready Authentication & Todo Service** implementing **Vertical Slice Architecture** with Refresh Token rotation, Ports & Adapters (Hexagonal) pattern, and strict Dependency Injection.

### Key Technologies
- **Runtime:** Node.js 18+ with ES2022 modules
- **Language:** TypeScript 5.3 (strict mode enabled)
- **Framework:** Express.js 4.18
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT tokens (access + refresh), Argon2 password hashing
- **Validation:** Zod schemas on all endpoints
- **Config:** Environment variables via dotenv

## Architecture

### Vertical Slice Structure

Each feature is a self-contained slice with its own layers:
```
src/application/
├── auth/                          # Auth feature slices
│   ├── sign-up/
│   ├── login/
│   ├── refresh-token/
│   └── get-user/
├── todo/                          # Todo feature slices
│   ├── create-todo/
│   ├── update-todo/
│   ├── get-todo-by-id/
│   └── delete-todo-by-id/
└── shared/                        # Shared infrastructure
    ├── models/                    # Interfaces (ports)
    ├── infrastructure/            # Implementations (adapters)
    └── sequelize/                 # Database layer

src/presentation/
├── controllers/                   # DI orchestration & route handlers
├── routes/                        # Express route definitions
└── middlewares/                   # Auth validation, request validation
```

### Pattern: Ports & Adapters

**Ports (Interfaces):** Defined in `src/application/shared/models/`
- `IUserRepository.ts` - User persistence
- `IToDoRepository.ts` - Todo persistence
- `ITokenService.ts` - JWT token generation/verification
- `ICryptoService.ts` - Password hashing
- `IRefreshTokenRepository.ts` - Token storage

**Adapters (Implementations):**
- In-memory: `InMemoryUserRepository.ts`, `InMemoryRefreshTokenRepository.ts`
- PostgreSQL: `UserRespoPostgreSql.ts`, `ToDoRepoPostgreSql.ts`, `RefreshTokenRepoPostgreSql.ts`
- JWT: `JwtTokenService.ts`
- Argon2: `Argon2CryptoService.ts`

Controllers depend on interfaces, making it easy to swap implementations (e.g., swap in-memory ↔ PostgreSQL) without changing business logic.

### Controllers as DI Wiring

Controllers in `src/presentation/controllers/` instantiate repositories and use cases:
```typescript
const toDoRepository = ToDoRepoPostgreSqlImp;  // Singleton adapter
const createToDoUseCase = new CreateToDoUseCase(toDoRepository);
const response = await createToDoUseCase.execute(userId, request);
```

This centralizes wiring while keeping use cases framework-agnostic.

## Database

**PostgreSQL with Sequelize ORM**

Models defined in `src/application/shared/sequelize/models/`:
- `UserModel.ts` - Users table
- `ToDoModel.ts` - Todos table (has userId foreign key)
- `RefreshTokenModel.ts` - Revoked refresh tokens
- `BaseModel.ts` - Shared timestamp/id fields

**Repository Pattern:** Sequelize repositories implement port interfaces:
- `UserRespoPostgreSql.ts` implements `IUserRepository`
- `ToDoRepoPostgreSql.ts` implements `IToDoRepository`

## Authentication Flow

1. **Sign-up/Login** → JWT access + refresh tokens returned
2. **Protected routes** → `authMiddleware` validates Bearer token, attaches `req.userId` and `req.email`
3. **Refresh Token** → Old token revoked, new pair issued (token rotation)
4. Tokens stored as environment variables; clients use Authorization header

## Key Environment Variables

See `.env.example`:
- `PORT` - Server port (default 3001)
- `NODE_ENV` - "development" or "production"
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` - JWT secrets
- `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY` - Token lifetimes (e.g., "24h", "7d")
- `POSTGRES_*` - PostgreSQL connection (host, port, db, user, password)

In production, generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Adding a New Feature

**Example: Add a "Get All Todos" endpoint**

1. **Create vertical slice:**
   ```
   src/application/todo/get-all-todos/
   ├── application/
   │   └── GetAllToDosUseCase.ts
   └── models/
       └── GetAllToDosDto.ts
   ```

2. **Define DTOs with Zod validation** in `GetAllToDosDto.ts`

3. **Implement use case** in `GetAllToDosUseCase.ts`:
   ```typescript
   export class GetAllToDosUseCase {
     constructor(private toDoRepository: IToDoRepository) {}
     async execute(userId: string): Promise<GetAllToDosResponse> {
       return await this.toDoRepository.findByUserId(userId);
     }
   }
   ```

4. **Create controller** in `src/presentation/controllers/GetAllToDosController.ts`

5. **Add route** to `src/presentation/routes/todo.routes.ts`

6. **Validation middleware** auto-applies Zod schemas via `validateRequest()`

## TypeScript Configuration

Strict mode enabled (`tsconfig.json`):
- `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`

This enforces type safety; fix errors with `npm run lint`.

## Docker Deployment

The project includes production-ready Docker and Docker Compose files:

**Files:**
- `Dockerfile` - Multi-stage build for optimized image size
- `docker-compose.yml` - Orchestrates app and PostgreSQL services
- `.dockerignore` - Excludes unnecessary files from build context
- `.env.docker` - Development environment template
- `.env.docker.prod` - Production environment template

**Key Features:**
- Multi-stage build reduces final image from ~800MB to ~400MB
- Non-root user for security
- Health checks for both app and database
- Automatic startup dependency ordering
- PostgreSQL persistence with volumes
- Resource limits (1GB CPU, 512MB memory)
- Comprehensive logging configuration

**Quick Start:**
```bash
docker-compose up --build              # Full stack with defaults
docker-compose --env-file .env.docker.prod up  # Production config
docker-compose logs -f app             # View logs
```

**Detailed Documentation:** See [DOCKER.md](DOCKER.md) for comprehensive Docker setup, troubleshooting, and production deployment guidance.

## Important Notes

- **Sequelize Singleton:** Database connection initialized in `src/index.ts` via `SequelizeSingleton.connect()`
- **Middleware order matters:** Auth middleware must come before route handlers
- **Request validation:** `validateRequest(schema)` middleware applies Zod validation before controllers
- **Error handling:** Controllers catch exceptions and return standardized error responses
- **Token revocation:** Refresh token rotation tracked in `RefreshTokenModel` to prevent token reuse

## Common Development Tasks

**Run server in development:**
```bash
npm run dev
```

**Add a new database model:**
1. Create model in `src/application/shared/sequelize/models/`
2. Extend `BaseModel` for common fields (id, createdAt, updatedAt)
3. Export from `src/application/shared/sequelize/models/index.ts`
4. Sequelize syncs automatically on startup

**Swap repository implementation (e.g., in-memory → PostgreSQL):**
- Update the singleton or controller instantiation; no other code changes needed due to port/adapter pattern

**Test a route:**
```bash
curl -X POST http://localhost:3001/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

Protected routes require Bearer token:
```bash
curl -X GET http://localhost:3001/v1/todo/list/123 \
  -H "Authorization: Bearer <access_token>"
```
