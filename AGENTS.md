# AGENTS.md - Agent Coding Guidelines

This file provides guidelines for AI agents working on this codebase.

---

## 1. Build, Lint & Test Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build & Production
npm run build        # Compile TypeScript to JavaScript (dist/)
npm start           # Run compiled application

# Linting & Type Checking
npm run lint        # TypeScript type checking (tsc --noEmit)

# Testing
npm test                   # Run all tests
npm test -- auth.register  # Run single test file (by name)
npm test:watch             # Run tests in watch mode
npm test:coverage          # Generate coverage report
```

---

## 2. Code Style Guidelines

### 2.1 Project Structure - Vertical Slice Architecture

```
src/
├── application/              # Business logic layer
│   ├── auth/               # Feature slice: auth
│   │   ├── sign-up/application/SignUpUseCase.ts
│   │   └── models/SignUpDto.ts
│   ├── todo/               # Feature slice: todo
│   └── shared/             # Shared infrastructure
│       ├── models/         # Interfaces (IUserRepository, etc.)
│       └── infrastructure/ # JWT, Crypto, Config
└── presentation/            # HTTP layer
    ├── controllers/
    ├── routes/
    └── middlewares/
```

### 2.2 Import Conventions

- Use **relative imports** for local modules
- Use **absolute imports** for packages
- Order: external → application → presentation

```typescript
// External packages
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

// Application layer (relative)
import { IUserRepository } from "../../../shared/models/IUserRepository";
import { SignUpRequest } from "../models/SignUpDto";
```

### 2.3 Naming Conventions

| Element     | Convention          | Example            |
| ----------- | ------------------- | ------------------ |
| Files       | kebab-case          | `sign-up.dto.ts`   |
| Classes     | PascalCase          | `SignUpUseCase`    |
| Interfaces  | PascalCase with `I` | `IUserRepository`  |
| Variables   | camelCase           | `userRepository`   |
| Enums       | PascalCase          | `PriorityEnum`     |
| Enum Values | UPPER_SNAKE         | `PriorityEnum.LOW` |

### 2.4 TypeScript & Zod Guidelines

- **Always use TypeScript** - No plain `any` types
- **Use Zod** for input validation DTOs
- **Use `unknown`** for caught errors, then narrow with type guards

```typescript
// Zod validation schemas
export const SignUpRequestSchema = z.object({
  name: z.string().trim().min(3, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

// Error handling
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "An error occurred";
}
```

### 2.5 Class & Controller Patterns

```typescript
// Use Case
export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cryptoService: ICryptoService,
  ) {}
  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    /* ... */
  }
}

// Controller
export const SignUpController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userRepository = GetUserRepositoryInstance();
    const cryptoService = new Argon2CryptoService();
    const signUpUseCase = new SignUpUseCase(userRepository, cryptoService);
    const response = await signUpUseCase.execute(req.body);
    res.status(201).json({ status: "success", data: response });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    if (message.includes("already exists")) {
      res.status(409).json({ status: "error", message });
    } else {
      res.status(500).json({ status: "error", message });
    }
  }
};
```

### 2.6 Response Format

```typescript
// Success
res.status(201).json({ status: "success", data: { ... } });

// Error
res.status(409).json({ status: "error", message: "User already exists" });
```

### 2.7 HTTP Status Codes

| Code | Usage                    |
| ---- | ------------------------ |
| 200  | GET/PATCH/DELETE success |
| 201  | Resource creation        |
| 400  | Validation errors        |
| 401  | Unauthorized             |
| 404  | Resource not found       |
| 409  | Conflict (duplicate)     |
| 500  | Server error             |

### 2.8 Middleware Usage

```typescript
router.post(
  "/register",
  validateRequest(SignUpRequestSchema), // Validates body
  async (req, res) => await SignUpController(req, res),
);
```

### 2.9 Swagger Documentation

Add `@swagger` JSDoc comments to routes for API documentation.

---

## 3. Testing Guidelines

```typescript
describe("Feature Description", () => {
  it("should do something specific", async () => {
    const result = await doSomething(input);
    expect(result).toEqual(expected);
  });
});
```

---

## 4. Important Notes

- **No comments** unless absolutely necessary
- **ES modules** - Project uses `type: "module"` in package.json
- **Environment variables** - All config via `.env` files, never hardcode secrets
- **Database migrations** - Located in `database/migrations/`
- **Docker** - Use `docker-compose.dev.yml` for local development
