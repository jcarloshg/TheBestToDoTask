import { Router } from 'express';
import { SignUpController } from '../controllers/SignUpController.js';
import { LoginController } from '../controllers/LoginController.js';
import { RefreshTokenController } from '../controllers/RefreshTokenController.js';
import { validateRequest } from '../middlewares/ValidationMiddleware.js';
import { SignUpRequestSchema } from '../../application/auth/sign-up/models/SignUpDto.js';
import { LoginRequestSchema } from '../../application/auth/login/models/LoginDto.js';
import { RefreshTokenRequestSchema } from '../../application/auth/refresh-token/models/RefreshTokenDto.js';

export function createAuthRoutes(
  signUpController: SignUpController,
  loginController: LoginController,
  refreshTokenController: RefreshTokenController
): Router {
  const router = Router();

  router.post('/sign-up', validateRequest(SignUpRequestSchema), (req, res) =>
    signUpController.handle(req, res)
  );

  router.post('/login', validateRequest(LoginRequestSchema), (req, res) =>
    loginController.handle(req, res)
  );

  router.post('/refresh-token', validateRequest(RefreshTokenRequestSchema), (req, res) =>
    refreshTokenController.handle(req, res)
  );

  return router;
}
