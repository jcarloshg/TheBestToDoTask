import { ENVIROMENT_VARIABLES } from "../infrastructure/EnviromentVariables";
import { InMemoryUserRepository } from "../infrastructure/InMemoryUserRepository";
import { UserRespoPostgreSqlImp } from "../sequelize/UserRespoPostgreSql";
import { User } from "./User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
}


// ─────────────────────────────────────
// Factory Function
// ─────────────────────────────────────

/**
 * this factory function returns the appropriate user repository implementation
 * based on the current environment (development, production, test).
 * @returns
 */
export const GetUserRepositoryInstance = (): IUserRepository => {
  // develoment and production use PostgreSQL and was cached throughout env vars

  if (ENVIROMENT_VARIABLES.NODE_ENV === "development")
    return UserRespoPostgreSqlImp;

  if (ENVIROMENT_VARIABLES.NODE_ENV === "production")
    return UserRespoPostgreSqlImp;

  if (ENVIROMENT_VARIABLES.NODE_ENV === "test")
    return new InMemoryUserRepository();

  return new InMemoryUserRepository();
};
