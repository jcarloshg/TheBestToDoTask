import { Sequelize } from "sequelize";
import { sequelizeConfig } from "./config";

class SequelizeSingleton {
  private static instance: Sequelize | null = null;

  private constructor() { }

  static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new Sequelize(sequelizeConfig);
    }
    return SequelizeSingleton.instance;
  }

  static async connect(): Promise<void> {
    console.log("\x1b[36m[SequelizeSingleton]\x1b[0m \x1b[90mConnecting to database...\x1b[0m");
    const sequelize = SequelizeSingleton.getInstance();
    try {
      await sequelize.authenticate();
      console.log("\x1b[32m✓\x1b[0m \x1b[36m[SequelizeSingleton]\x1b[0m \x1b[2mDatabase connection established successfully\x1b[0m");
    } catch (error) {
      console.error("\x1b[31m✗\x1b[0m \x1b[36m[SequelizeSingleton]\x1b[0m \x1b[2mUnable to connect to the database:\x1b[0m", error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (SequelizeSingleton.instance) {
      await SequelizeSingleton.instance.close();
      SequelizeSingleton.instance = null;
      console.log("\x1b[33m◉\x1b[0m \x1b[36m[SequelizeSingleton]\x1b[0m \x1b[2mDatabase connection closed\x1b[0m");
    }
  }

  static async sync(options?: {
    force?: boolean;
    alter?: boolean;
  }): Promise<void> {
    const sequelize = SequelizeSingleton.getInstance();
    await sequelize.sync(options);
    console.log("\x1b[32m✓\x1b[0m \x1b[36m[SequelizeSingleton]\x1b[0m \x1b[2mDatabase synchronized\x1b[0m");
  }
}

export { SequelizeSingleton };
export default SequelizeSingleton;
