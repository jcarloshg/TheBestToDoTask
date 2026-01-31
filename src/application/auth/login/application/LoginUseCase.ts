import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "../../../shared/models/IUserRepository";
import { ICryptoService } from "../../../shared/models/ICryptoService";
import { ITokenService } from "../../../shared/models/ITokenService";
import {
  IRefreshTokenRepository,
  RefreshTokenEntity,
  RefreshTokenToSaveEntity,
} from "../../../shared/models/IRefreshTokenRepository";
import { LoginRequest, LoginResponse } from "../models/LoginDto";

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cryptoService: ICryptoService,
    private tokenService: ITokenService,
    private refreshTokenRepository: IRefreshTokenRepository,
  ) { }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await this.cryptoService.verify(
        request.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = this.tokenService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Store refresh token in database
      const refreshTokenEntity: RefreshTokenToSaveEntity = {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date()
      };
      console.log(`refreshTokenEntity: `, refreshTokenEntity);

      await this.refreshTokenRepository.save(refreshTokenEntity);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      console.log(`message: `, message);
      throw new Error(`Login failed. Try again later.`);
    }
  }
}
