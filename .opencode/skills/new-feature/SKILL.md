---
name: new-feature
description: Create a new feature using the vertical slice architecture pattern
---

## What I do
Creates a new feature with the following structure:
- `src/application/{feature-name}/models/` - DTOs with Zod validation
- `src/application/{feature-name}/application/` - Use cases with business logic
- `src/presentation/controllers/` - Request handlers
- `src/presentation/routes/` - Express router definitions

## Project Structure
```
src/
├── application/
│   ├── {feature}/
│   │   ├── models/{FeatureName}Dto.ts
│   │   └── application/{FeatureName}UseCase.ts
│   └── shared/
│       ├── models/ (interfaces)
│       └── infrastructure/ (JWT, Crypto, Config)
└── presentation/
    ├── controllers/
    └── routes/
```

## Code Patterns

### DTO (Zod validation)
```typescript
import { z } from "zod";

export const FeatureRequestSchema = z.object({
  field: z.string().trim().min(1, 'Field is required'),
});

export type FeatureRequest = z.infer<typeof FeatureRequestSchema>;
```

### Use Case
```typescript
export class FeatureUseCase {
  constructor(
    private repository: IRepository,
    private service: IService,
  ) {}

  async execute(request: FeatureRequest): Promise<Response> {
    // Business logic here
  }
}
```

### Controller
```typescript
export const FeatureController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const repository = getRepositoryInstance();
    const service = new Service();
    const useCase = new FeatureUseCase(repository, service);
    const response = await useCase.execute(req.body);
    res.status(201).json({ status: "success", data: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ status: "error", message });
  }
};
```

## Naming Conventions
- Files: kebab-case (e.g., `sign-up.dto.ts`)
- Classes: PascalCase (e.g., `SignUpUseCase`)
- Interfaces: PascalCase with `I` prefix (e.g., `IUserRepository`)
- Variables: camelCase

## When to use me
Use this when adding a new feature to the application following the vertical slice architecture.
