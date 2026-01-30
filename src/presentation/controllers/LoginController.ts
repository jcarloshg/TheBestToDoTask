import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/auth/login/application/LoginUseCase';
import { LoginRequest } from '../../application/auth/login/models/LoginDto';

export class LoginController {
  constructor(private loginUseCase: LoginUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const request: LoginRequest = req.body;
      const response = await this.loginUseCase.execute(request);

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
