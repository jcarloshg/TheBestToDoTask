import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
