import { z } from 'zod';

export const SignUpRequestSchema = z.object({
  name: z.string().trim().min(3, 'Name is required').nonempty('Name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

export const SignUpResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.date(),
});

export type SignUpResponse = z.infer<typeof SignUpResponseSchema>;
