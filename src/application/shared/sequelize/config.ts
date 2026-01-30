import { ENVIROMENT_VARIABLES } from "../infrastructure/EnviromentVariables";

export const sequelizeConfig = {
  dialect: "postgres" as const,
  host: ENVIROMENT_VARIABLES.POSTGRES_HOST,
  port: parseInt(ENVIROMENT_VARIABLES.POSTGRES_PORT, 10),
  username: ENVIROMENT_VARIABLES.POSTGRES_USER,
  password: ENVIROMENT_VARIABLES.POSTGRES_PASSWORD,
  database: ENVIROMENT_VARIABLES.POSTGRES_DB,
  logging: ENVIROMENT_VARIABLES.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
};
