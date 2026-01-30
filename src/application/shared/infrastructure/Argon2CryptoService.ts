import { hash, verify } from 'argon2';
import { ICryptoService } from '../models/ICryptoService.js';

export class Argon2CryptoService implements ICryptoService {
  async hash(password: string): Promise<string> {
    return hash(password);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await verify(hash, password);
    } catch {
      return false;
    }
  }
}
