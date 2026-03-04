---
name: zod-best-practices
description: Apply Zod validation best practices for DTOs and schemas
---

## What I do
Provides guidelines and patterns for using Zod effectively in this project.

## Zod Best Practices

### 1. Schema Definition
```typescript
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "user", "guest"]),
  createdAt: z.string().datetime(),
});
```

### 2. Input vs Output Schemas
Separate schemas for different use cases:
```typescript
// Input: What comes from the client
export const CreateUserInputSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
});

// Output: What goes back to the client (exclude sensitive fields)
export const UserOutputSchema = CreateUserInputSchema.omit({ password: true }).extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UserOutput = z.infer<typeof UserOutputSchema>;
```

### 3. Partial Updates
```typescript
export const UpdateUserInputSchema = CreateUserInputSchema.partial();

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
```

### 4. Nested Objects
```typescript
export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

export const UserWithAddressSchema = UserSchema.extend({
  address: AddressSchema.nullable(),
});
```

### 5. Arrays
```typescript
export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  completed: z.boolean(),
});

export const TodoListSchema = z.array(TodoSchema);
```

### 6. Union Types
```typescript
export const StatusSchema = z.enum(["pending", "active", "completed", "cancelled"]);

// Discriminated union for different variants
export const PaymentMethodSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("card"), cardNumber: z.string().min(16).max(16) }),
  z.object({ type: z.literal("paypal"), email: z.string().email() }),
]);
```

### 7. Custom Validation
```typescript
export const CustomSchema = z.object({
  // Custom validator
  username: z.string().refine(
    (val) => /^[a-zA-Z0-9_]+$/.test(val),
    { message: "Username can only contain letters, numbers, and underscores" }
  ),
  // Async validation
  apiKey: z.string().refine(
    async (val) => await checkApiKeyExists(val),
    { message: "API key does not exist" }
  ),
});
```

### 8. Transform
```typescript
export const SanitizedStringSchema = z.string().trim().transform((val) => val.toLowerCase());

export const UserCreationSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().transform((val) => val.toLowerCase()),
});
```

### 9. Coercion (for numbers/booleans from strings)
```typescript
export const NumericQuerySchema = z.coerce.number().min(1).max(100);
export const BooleanQuerySchema = z.coerce.boolean();
```

### 10. Error Handling
```typescript
try {
  const data = schema.parse(req.body);
} catch (error) {
  if (error instanceof z.ZodError) {
    const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    return res.status(400).json({ status: "error", messages });
  }
}
```

## Common Patterns

### Request DTOs
- Use `.trim()` on all string inputs
- Always add custom error messages
- Use `.min(1)` instead of `.nonempty()` (more explicit)

### Response DTOs
- Never expose sensitive data (passwords, tokens)
- Use `.omit()` to remove fields
- Use `.extend()` to add fields

### Query Parameters
- Use `z.coerce` for type conversion
- Use `.optional()` for optional params

### Validation in Middleware
```typescript
export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        res.status(400).json({ status: "error", messages });
      }
    }
  };
};
```

## When to use me
Use this when:
- Creating new DTOs or validation schemas
- Refactoring existing Zod schemas
- Adding input validation to endpoints
- Designing API request/response types
