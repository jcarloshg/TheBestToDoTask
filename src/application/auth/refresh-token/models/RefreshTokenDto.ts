import { z } from 'zod';

// Refresh token is received from HTTP-only cookie, not from request body
// The request body is now empty since the token comes from cookies
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}).strict();

// For the controller to pass the refreshToken from cookies
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Internal response (includes refresh token for processing)
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// Response sent to client (refresh token is sent via HTTP-only cookie)
export const RefreshTokenClientResponseSchema = z.object({
  accessToken: z.string(),
});

export type RefreshTokenClientResponse = z.infer<typeof RefreshTokenClientResponseSchema>;
