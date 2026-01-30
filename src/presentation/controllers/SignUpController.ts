import { Request, Response } from 'express';
import { SignUpUseCase } from '../../application/auth/sign-up/application/SignUpUseCase.js';
import { SignUpRequest } from '../../application/auth/sign-up/models/SignUpDto.js';

export class SignUpController {
  constructor(private signUpUseCase: SignUpUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const request: SignUpRequest = req.body;
      const response = await this.signUpUseCase.execute(request);

      res.status(201).json({
        status: 'success',
        data: response,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';

      if (message.includes('already exists')) {
        res.status(409).json({
          status: 'error',
          message,
        });
      } else {
        res.status(500).json({
          status: 'error',
          message,
        });
      }
    }
  }
}
