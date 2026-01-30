import { Sequelize } from "sequelize";
import { sequelizeConfig } from "./config";

class SequelizeSingleton {
  private static instance: Sequelize | null = null;

  private constructor() {}

  static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new Sequelize(sequelizeConfig);
    }
    return SequelizeSingleton.instance;
  }

  static async connect(): Promise<void> {
    const sequelize = SequelizeSingleton.getInstance();
    try {
      await sequelize.authenticate();
      console.log("Database connection established successfully");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (SequelizeSingleton.instance) {
      await SequelizeSingleton.instance.close();
      SequelizeSingleton.instance = null;
      console.log("Database connection closed");
    }
  }

  static async sync(options?: { force?: boolean; alter?: boolean }): Promise<void> {
    const sequelize = SequelizeSingleton.getInstance();
    await sequelize.sync(options);
    console.log("Database synchronized");
  }
}

export { SequelizeSingleton };
export default SequelizeSingleton;
