import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../../shared/models/IUserRepository.js';
import { ITokenService } from '../../../shared/models/ITokenService.js';
import { IRefreshTokenRepository, RefreshTokenEntity } from '../../../shared/models/IRefreshTokenRepository.js';
import { RefreshTokenRequest, RefreshTokenResponse } from '../models/RefreshTokenDto.js';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
    private refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // Verify the refresh token
    const tokenPayload = this.tokenService.verifyRefreshToken(request.refreshToken);
    if (!tokenPayload) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await this.refreshTokenRepository.findByToken(request.refreshToken);
    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    if (storedToken.revokedAt) {
      throw new Error('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new Error('Refresh token has expired');
    }

    // Verify user still exists
    const user = await this.userRepository.findById(tokenPayload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Revoke old refresh token (token rotation)
    await this.refreshTokenRepository.revokeByToken(request.refreshToken);

    // Generate new token pair
    const newAccessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store new refresh token
    const newRefreshTokenEntity: RefreshTokenEntity = {
      id: uuidv4(),
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      revokedAt: null,
    };

    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
