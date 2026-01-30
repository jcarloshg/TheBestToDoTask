import { Express, Router } from "express";
import { SignUpController } from "../controllers/SignUpController";
import { LoginController } from "../controllers/LoginController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { validateRequest } from "../middlewares/ValidationMiddleware";
import { SignUpRequestSchema } from "../../application/auth/sign-up/models/SignUpDto";
import { LoginRequestSchema } from "../../application/auth/login/models/LoginDto";
import { RefreshTokenRequestSchema } from "../../application/auth/refresh-token/models/RefreshTokenDto";
import { SignUpUseCase } from "../../application/auth/sign-up/application/SignUpUseCase";
import { GetUserRepositoryInstance } from "../../application/shared/models/IUserRepository";
import {
  Argon2CryptoService,
  Argon2CryptoServiceImp,
} from "../../application/shared/infrastructure/Argon2CryptoService";

export function createAuthRoutes(
  // signUpController: SignUpController,
  // loginController: LoginController,
  // refreshTokenController: RefreshTokenController,
  app: Express,
) {
  const router = Router();

  router.post(
    "/sign-up",
    validateRequest(SignUpRequestSchema),
    async (req, res) => await new SignUpController().handle(req, res),
  );

  //   router.post("/login", validateRequest(LoginRequestSchema), (req, res) =>
  //     loginController.handle(req, res),
  //   );
  //
  //   router.post(
  //     "/refresh-token",
  //     validateRequest(RefreshTokenRequestSchema),
  //     (req, res) => refreshTokenController.handle(req, res),
  //   );

  app.use("/api/messages", router);
  // return router;
}
