import SequelizeSingleton from "./index";
import { UserModel } from "./models";

export class Database {
  static async initialize(): Promise<void> {
    try {
      await SequelizeSingleton.connect();
      await SequelizeSingleton.sync();
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await SequelizeSingleton.disconnect();
    } catch (error) {
      console.error("Failed to disconnect database:", error);
      throw error;
    }
  }

  static getInstance() {
    return SequelizeSingleton.getInstance();
  }

  static getModels() {
    return {
      User: UserModel,
    };
  }
}

export default Database;
