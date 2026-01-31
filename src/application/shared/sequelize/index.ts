import { Sequelize } from "sequelize";
import { ENVIROMENT_VARIABLES } from "../infrastructure/EnviromentVariables";

class SequelizeSingleton {
  private static instance: Sequelize | null = null;

  private constructor() { }

  static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      // SequelizeSingleton.instance = new Sequelize(sequelizeConfig);
      SequelizeSingleton.instance = new Sequelize({
        dialect: "postgres",
        host: ENVIROMENT_VARIABLES.POSTGRES_HOST,
        port: parseInt(ENVIROMENT_VARIABLES.POSTGRES_PORT, 10),
        username: ENVIROMENT_VARIABLES.POSTGRES_USER,
        password: ENVIROMENT_VARIABLES.POSTGRES_PASSWORD,
        database: ENVIROMENT_VARIABLES.POSTGRES_DB,

        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      });
    }
    return SequelizeSingleton.instance;
  }

  static async connect(): Promise<void> {
    const sequelize = SequelizeSingleton.getInstance();
    try {
      await sequelize.authenticate();
    } catch (error) {
      console.error(
        "\x1b[31m✗\x1b[0m \x1b[36m[SequelizeSingleton]\x1b[0m \x1b[2mUnable to connect to the database:\x1b[0m",
        error,
      );
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (SequelizeSingleton.instance) {
      await SequelizeSingleton.instance.close();
      SequelizeSingleton.instance = null;
    }
  }

  static async sync(options?: {
    force?: boolean;
    alter?: boolean;
  }): Promise<void> {
    const sequelize = SequelizeSingleton.getInstance();
    await sequelize.sync(options);
  }
}

export { SequelizeSingleton };
export default SequelizeSingleton;
