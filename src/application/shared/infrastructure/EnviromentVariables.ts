import "dotenv/config";

export interface IENVIROMENT_VARIABLES {
  // Server Configuration
  PORT: string;

  // Node Environment
  NODE_ENV: string;

  // JWT Secrets
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
}

const EnviromentVariables = (): IENVIROMENT_VARIABLES => {
  return {
    PORT: process.env.PORT ?? "3000",
    NODE_ENV: process.env.NODE_ENV ?? "development",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? "dev-access-secret-key",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? "dev-refresh-secret-key",
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY ?? "24h",
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY ?? "7d",
  };
};

export const ENVIROMENT_VARIABLES = EnviromentVariables();
