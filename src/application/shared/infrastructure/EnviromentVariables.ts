import "dotenv/config";

export type NODE_ENV_VALUE = "development" | "production" | "test";

export interface IENVIROMENT_VARIABLES {
  // Server Configuration
  PORT: string;

  // Node Environment
  NODE_ENV: NODE_ENV_VALUE;

  // JWT Secrets
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;

  //  PostgreSQL Database Configuration
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_PORT: string;
  POSTGRES_HOST: string;
}

const EnviromentVariables = (): IENVIROMENT_VARIABLES => {
  const envs: IENVIROMENT_VARIABLES = {
    // Server Configuration
    PORT: process.env.PORT ?? "3000",
    // Node Environment
    NODE_ENV: (process.env.NODE_ENV ?? "development") as NODE_ENV_VALUE,
    // JWT Secrets
    ACCESS_TOKEN_SECRET:
      process.env.ACCESS_TOKEN_SECRET ?? "dev-access-secret-key",
    REFRESH_TOKEN_SECRET:
      process.env.REFRESH_TOKEN_SECRET ?? "dev-refresh-secret-key",
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY ?? "24h",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY ?? "7d",
    // PostgreSQL Database Configuration
    POSTGRES_DB: process.env.POSTGRES_DB ?? "name",
    POSTGRES_USER: process.env.POSTGRES_USER ?? "user",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? "password",
    POSTGRES_PORT: process.env.POSTGRES_PORT ?? "5432",
    POSTGRES_HOST: process.env.POSTGRES_HOST ?? "localhost",
  };

  return envs;
};

export const ENVIROMENT_VARIABLES = EnviromentVariables();
