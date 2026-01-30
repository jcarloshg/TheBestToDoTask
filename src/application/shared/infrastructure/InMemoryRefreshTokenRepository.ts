import { IRefreshTokenRepository, RefreshTokenEntity } from '../models/IRefreshTokenRepository.js';

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  private tokens: Map<string, RefreshTokenEntity> = new Map();

  async save(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    this.tokens.set(token.token, token);
    return token;
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    return this.tokens.get(token) ?? null;
  }

  async revokeByToken(token: string): Promise<void> {
    const entity = this.tokens.get(token);
    if (entity) {
      entity.revokedAt = new Date();
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    for (const token of this.tokens.values()) {
      if (token.userId === userId) {
        token.revokedAt = new Date();
      }
    }
  }
}
