import { Request, Response } from 'express';
import { RefreshTokenUseCase } from '../../application/auth/refresh-token/application/RefreshTokenUseCase';
import { RefreshTokenRequest } from '../../application/auth/refresh-token/models/RefreshTokenDto';

export class RefreshTokenController {
  constructor(private refreshTokenUseCase: RefreshTokenUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const request: RefreshTokenRequest = req.body;
      const response = await this.refreshTokenUseCase.execute(request);

      res.status(200).json({
        status: 'success',
        data: response,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';

      res.status(401).json({
        status: 'error',
        message,
      });
    }
  }
}
