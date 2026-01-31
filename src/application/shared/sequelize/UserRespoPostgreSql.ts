import { IUserRepository } from "../models/IUserRepository";
import { User } from "../models/User";
import UserModel from "./models/UserModel";

export class UserRespoPostgreSql implements IUserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await UserModel.create({
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      nombre: "",
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      passwordHash: createdUser.password,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {

    const userFound = await UserModel.findOne({ where: { email } });

    if (!userFound) return null;

    console.log(`userFound.dataValues: `, userFound.dataValues);

    return {
      id: userFound.dataValues.id,
      email: userFound.dataValues.email,
      passwordHash: userFound.dataValues.password,
      createdAt: userFound.dataValues.createdAt!,
      updatedAt: userFound.dataValues.updatedAt!,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(user: User): Promise<User> {
    await UserModel.update(
      {
        email: user.email,
        password: user.passwordHash,
      },
      {
        where: { id: user.id },
      },
    );

    const updatedUser = await UserModel.findByPk(user.id);

    if (!updatedUser) {
      throw new Error("User not found after update");
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      passwordHash: updatedUser.password,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}

// singleton instance
export const UserRespoPostgreSqlImp = new UserRespoPostgreSql();
