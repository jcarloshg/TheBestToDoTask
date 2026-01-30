export interface RefreshTokenEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface IRefreshTokenRepository {
  save(token: RefreshTokenEntity): Promise<RefreshTokenEntity>;
  findByToken(token: string): Promise<RefreshTokenEntity | null>;
  revokeByToken(token: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
