import { Express, Router } from "express";
import { SignUpController } from "../controllers/SignUpController";
import { LoginController } from "../controllers/LoginController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { validateRequest } from "../middlewares/ValidationMiddleware";
import { SignUpRequestSchema } from "../../application/auth/sign-up/models/SignUpDto";
import { LoginRequestSchema } from "../../application/auth/login/models/LoginDto";
import { RefreshTokenRequestSchema } from "../../application/auth/refresh-token/models/RefreshTokenDto";

export function createAuthRoutes(app: Express) {
  const router = Router();

  router.post(
    "/sign-up",
    validateRequest(SignUpRequestSchema),
    async (req, res) => await SignUpController(req, res),
  );

  router.post(
    "/login",
    validateRequest(LoginRequestSchema),
    async (req, res) => await LoginController(req, res),
  );

  router.post(
    "/refresh-token",
    validateRequest(RefreshTokenRequestSchema),
    async (req, res) => await RefreshTokenController(req, res),
  );

  app.use("/api/auth", router);
}
