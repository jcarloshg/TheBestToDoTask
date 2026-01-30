import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../../shared/models/IUserRepository';
import { ICryptoService } from '../../../shared/models/ICryptoService';
import { User } from '../../../shared/models/User';
import { SignUpRequest, SignUpResponse } from '../models/SignUpDto';

export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cryptoService: ICryptoService
  ) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.cryptoService.hash(request.password);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: request.email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdUser = await this.userRepository.create(newUser);

    return {
      id: createdUser.id,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }
}
