# Authentication Service - Vertical Slice Architecture

A production-ready Node.js & TypeScript authentication service implementing **Vertical Slice Architecture** with Refresh Token rotation, Ports & Adapters pattern, and strict dependency injection.

## Architecture Overview

### Design Principles

**Vertical Slice Architecture:**

- Each feature (sign-up, login, refresh-token) is a self-contained vertical slice
- Slices include application logic, domain models, and infrastructure adapters
- Minimal cross-slice coupling; only shared services bridge slices

**Ports & Adapters (Hexagonal Architecture):**

- **Ports** (Interfaces): Define contracts in `models/` folders
- **Adapters** (Implementations): Concrete classes in `infrastructure/` folders
- Use cases depend on interfaces, not implementations
- Easy to swap implementations (e.g., in-memory ↔ database)

**Dependency Injection:**

- Controllers orchestrate DI
- Use cases receive dependencies via constructor
- All wiring happens in `src/index.ts`

### Project Structure

```
src/
├── application/
│   ├── auth/
│   │   ├── sign-up/
│   │   │   ├── application/
│   │   │   │   └── SignUpUseCase.ts       # Business logic
│   │   │   └── models/
│   │   │       └── SignUpDto.ts           # DTOs & Zod schemas
│   │   ├── login/
│   │   │   ├── application/
│   │   │   │   └── LoginUseCase.ts
│   │   │   └── models/
│   │   │       └── LoginDto.ts
│   │   └── refresh-token/
│   │       ├── application/
│   │       │   └── RefreshTokenUseCase.ts # Token rotation logic
│   │       └── models/
│   │           └── RefreshTokenDto.ts
│   └── shared/
│       ├── models/
│       │   ├── IUserRepository.ts         # Port: User persistence
│       │   ├── ITokenService.ts           # Port: Token generation
│       │   ├── ICryptoService.ts          # Port: Password hashing
│       │   ├── IRefreshTokenRepository.ts # Port: Token storage
│       │   └── User.ts                    # Domain entity + Zod schema
│       └── infrastructure/
│           ├── JwtTokenService.ts         # Adapter: JWT implementation
│           ├── Argon2CryptoService.ts     # Adapter: Argon2 hashing
│           ├── InMemoryUserRepository.ts  # Adapter: In-memory storage
│           └── InMemoryRefreshTokenRepository.ts
├── presentation/
│   ├── controllers/
│   │   ├── SignUpController.ts            # DI orchestration
│   │   ├── LoginController.ts
│   │   └── RefreshTokenController.ts
│   ├── middlewares/
│   │   └── ValidationMiddleware.ts        # Zod validation
│   └── routes/
│       └── authRoutes.ts                  # Express route definitions
└── index.ts                               # Application entry point & DI wiring
```

## Technical Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| **Runtime**          | Node.js 18+                  |
| **Language**         | TypeScript 5.3 (Strict Mode) |
| **Framework**        | Express.js 4.18              |
| **Validation**       | Zod 3.22                     |
| **Password Hashing** | Argon2 0.31                  |
| **JWT Tokens**       | jsonwebtoken 9.1             |
| **ID Generation**    | UUID 9.0                     |
| **Config**           | dotenv 16.3                  |
| **Dev Runtime**      | tsx 4.7 (watch mode)         |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone and navigate to project
cd TheBestToDoTask

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# (Optional) Update .env with custom secrets
```

### Running the Service

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production build & run:**

```bash
npm run build
npm start
```

**Type checking:**

```bash
npm run lint
```

## API Endpoints

### Sign Up

```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    }
  }
}
```

### Refresh Token (with Rotation)

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Old refresh token is revoked during rotation, enhancing security.

## Security Features

1. **Password Security:**
   - Argon2 hashing (resistant to GPU cracking)
   - Never stored in plain text
   - Verified on login

2. **Token Management:**
   - JWT with separate secrets for access/refresh tokens
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Refresh token rotation on every renewal
   - Token revocation tracking

3. **Input Validation:**
   - Zod schema validation on all endpoints
   - Email format validation
   - Password strength requirements

4. **Configuration:**
   - Environment-based secrets management
   - No hardcoded credentials
   - Type-safe configuration

## Adding New Slices

To add a new authentication feature (e.g., password-reset):

1. **Create the vertical slice:**

   ```
   src/application/auth/password-reset/
   ├── application/
   │   └── PasswordResetUseCase.ts
   └── models/
       └── PasswordResetDto.ts
   ```

2. **Define DTOs and Zod schemas** in `models/PasswordResetDto.ts`

3. **Implement business logic** in `application/PasswordResetUseCase.ts`:

   ```typescript
   export class PasswordResetUseCase {
     constructor(
       private userRepository: IUserRepository,
       private cryptoService: ICryptoService,
       // ... other dependencies via injection
     ) {}

     async execute(
       request: PasswordResetRequest,
     ): Promise<PasswordResetResponse> {
       // Business logic here
     }
   }
   ```

4. **Create a controller** in `src/presentation/controllers/PasswordResetController.ts`

5. **Add routes** to `src/presentation/routes/authRoutes.ts`

6. **Wire in `src/index.ts`:**
   ```typescript
   const passwordResetUseCase = new PasswordResetUseCase(
     userRepository,
     cryptoService,
   );
   const passwordResetController = new PasswordResetController(
     passwordResetUseCase,
   );
   ```

## Swapping Adapters

The architecture makes it easy to replace implementations:

### Replace In-Memory Repository with MongoDB

1. Create a new adapter: `src/application/shared/infrastructure/MongoUserRepository.ts`

   ```typescript
   export class MongoUserRepository implements IUserRepository {
     async create(user: User): Promise<User> {
       // MongoDB logic
     }
     // ... implement all interface methods
   }
   ```

2. Update `src/index.ts`:
   ```typescript
   // const userRepository = new InMemoryUserRepository();
   const userRepository = new MongoUserRepository();
   ```

No other code changes needed!

## Testing Considerations

With this architecture, testing is straightforward:

**Unit Testing Use Cases:**

```typescript
it("should hash password and create user", async () => {
  const mockRepo = {
    create: jest.fn().mockResolvedValue(newUser),
    findByEmail: jest.fn().mockResolvedValue(null),
  };
  const mockCrypto = {
    hash: jest.fn().mockResolvedValue("hashed"),
  };

  const useCase = new SignUpUseCase(mockRepo, mockCrypto);
  const result = await useCase.execute(request);

  expect(mockRepo.create).toHaveBeenCalled();
});
```

**Integration Testing Controllers:**

```typescript
it("should return 201 on successful sign-up", async () => {
  const response = await request(app)
    .post("/api/auth/sign-up")
    .send({ email: "test@example.com", password: "Password123" });

  expect(response.status).toBe(201);
});
```

## Environment Variables

| Variable               | Description                          | Default                |
| ---------------------- | ------------------------------------ | ---------------------- |
| `PORT`                 | Server port                          | 3000                   |
| `ACCESS_TOKEN_SECRET`  | JWT secret for access tokens         | dev-access-secret-key  |
| `REFRESH_TOKEN_SECRET` | JWT secret for refresh tokens        | dev-refresh-secret-key |
| `NODE_ENV`             | Environment (development/production) | development            |

**⚠️ In production**, generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Production Considerations

1. **Database:** Replace in-memory repositories with real database (MongoDB, PostgreSQL, etc.)
2. **Token Storage:** Use secure, HTTPOnly cookies for tokens in browser clients
3. **Rate Limiting:** Add rate limiting middleware on auth endpoints
4. **Logging:** Implement structured logging (Winston, Pino)
5. **Monitoring:** Add health checks and metrics
6. **CORS:** Configure appropriately for your frontend domains
7. **HTTPS:** Always use HTTPS in production
8. **Secret Rotation:** Implement JWT secret rotation strategies
9. **Audit Logging:** Track authentication events for security
10. **Error Handling:** Avoid leaking sensitive information in error messages

## File Checklist

✅ `package.json` - Strict dependency separation
✅ `tsconfig.json` - Strict TypeScript settings
✅ `.gitignore` - System files, build artifacts, secrets
✅ **Vertical Slices** - sign-up, login, refresh-token
✅ **Ports & Adapters** - Interfaces in models/, implementations in infrastructure/
✅ **Dependency Injection** - Constructor injection, wired in index.ts
✅ **Use Cases** - Business logic isolated from framework
✅ **Controllers** - Express orchestration layer
✅ **Validation** - Zod middleware on all endpoints
✅ **Security** - Argon2 hashing, JWT tokens, token rotation

## License

MIT
