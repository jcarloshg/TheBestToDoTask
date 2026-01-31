import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../../shared/models/IUserRepository';
import { ICryptoService } from '../../../shared/models/ICryptoService';
import { User } from '../../../shared/models/User';
import { SignUpRequest, SignUpResponse } from '../models/SignUpDto';

export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cryptoService: ICryptoService
  ) { }

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    // Check if user already exists
    console.log("\n");
    console.log(`request: `, request);
    const existingUser = await this.userRepository.findByEmail(request.email);
    console.log(`existingUser: `, existingUser);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.cryptoService.hash(request.password);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: request.email,
      name: request.name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(`newUser: `, newUser);
    const createdUser = await this.userRepository.create(newUser);

    console.log(`createdUser: `, createdUser);

    return {
      id: createdUser.id,
      email: createdUser.email,
      // name: createdUser.name,
      createdAt: createdUser.createdAt,
    };
  }
}
