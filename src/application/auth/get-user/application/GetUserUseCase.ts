import { IUserRepository } from "../../../shared/models/IUserRepository";

export interface GetUserResponse {
  id: string;
  email: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<GetUserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
