import { IUserRepository } from "../models/IUserRepository";
import { User } from "../models/User";
import UserModel from "./models/UserModel";

export class UserRespoPostgreSql implements IUserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await UserModel.create({
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      name: user.name,
    });

    if (!createdUser || !createdUser.dataValues) {
      throw new Error("Failed to create user");
    }

    return {
      id: createdUser.dataValues.id,
      email: createdUser.dataValues.email,
      name: createdUser.dataValues.name,
      passwordHash: createdUser.dataValues.password,
      createdAt: createdUser.dataValues.createdAt!,
      updatedAt: createdUser.dataValues.updatedAt!,
    };
  }

  async findByEmail(email: string): Promise<User | null> {

    const userFound = await UserModel.findOne({ where: { email } });

    console.log(`userFound: `, userFound);

    if (!userFound || !userFound.dataValues) return null;

    return {
      id: userFound.dataValues.id,
      email: userFound.dataValues.email,
      name: userFound.dataValues.name,
      passwordHash: userFound.dataValues.password,
      createdAt: userFound.dataValues.createdAt!,
      updatedAt: userFound.dataValues.updatedAt!,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);

    if (!user || !user.dataValues) return null;

    return {
      id: user.dataValues.id,
      email: user.dataValues.email,
      name: user.dataValues.name,
      passwordHash: user.dataValues.password,
      createdAt: user.dataValues.createdAt!,
      updatedAt: user.dataValues.updatedAt!,
    };
  }

  async update(user: User): Promise<User> {
    await UserModel.update(
      {
        email: user.email,
        name: user.name,
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
      name: updatedUser.name,
      passwordHash: updatedUser.password,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}

// singleton instance
export const UserRespoPostgreSqlImp = new UserRespoPostgreSql();
