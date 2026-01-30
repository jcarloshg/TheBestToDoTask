export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface ITokenService {
  generateAccessToken(payload: Omit<TokenPayload, 'type'>): string;
  generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
}
