import { IUserRepository } from '../models/IUserRepository.js';
import { User } from '../models/User.js';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
