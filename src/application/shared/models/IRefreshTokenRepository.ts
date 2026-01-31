import { ENVIROMENT_VARIABLES } from "../infrastructure/EnviromentVariables";
import { InMemoryRefreshTokenRepository } from "../infrastructure/InMemoryRefreshTokenRepository";
import { RefreshTokenRepoPostgreSqlImp } from "../sequelize/RefreshTokenRepoPostgreSql";

export interface RefreshTokenEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface RefreshTokenToSaveEntity {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IRefreshTokenRepository {
  save(token: RefreshTokenToSaveEntity): Promise<RefreshTokenEntity>;
  findByToken(token: string): Promise<RefreshTokenEntity | null>;
  revokeByToken(token: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}



// ─────────────────────────────────────
// Factory Function
// ─────────────────────────────────────

/**
 * this factory function returns the appropriate refresh token repository implementation
 * based on the current environment (development, production, test).
 * @returns
 */
export const GetRefreshTokenRepositoryInstance = (): IRefreshTokenRepository => {
  // develoment and production use PostgreSQL and was cached throughout env vars

  if (ENVIROMENT_VARIABLES.NODE_ENV === "development")
    return RefreshTokenRepoPostgreSqlImp;

  if (ENVIROMENT_VARIABLES.NODE_ENV === "production")
    return RefreshTokenRepoPostgreSqlImp;

  if (ENVIROMENT_VARIABLES.NODE_ENV === "test")
    return new InMemoryRefreshTokenRepository();

  return new InMemoryRefreshTokenRepository();
};