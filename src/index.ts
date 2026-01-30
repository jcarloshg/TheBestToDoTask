import "dotenv/config";
import express from "express";
import { SignUpUseCase } from "./application/auth/sign-up/application/SignUpUseCase.js";
import { LoginUseCase } from "./application/auth/login/application/LoginUseCase.js";
import { RefreshTokenUseCase } from "./application/auth/refresh-token/application/RefreshTokenUseCase.js";
import { SignUpController } from "./presentation/controllers/SignUpController.js";
import { LoginController } from "./presentation/controllers/LoginController.js";
import { RefreshTokenController } from "./presentation/controllers/RefreshTokenController.js";
import { createAuthRoutes } from "./presentation/routes/authRoutes.js";
import { JwtTokenService } from "./application/shared/infrastructure/JwtTokenService.js";
import { Argon2CryptoService } from "./application/shared/infrastructure/Argon2CryptoService.js";
import { InMemoryUserRepository } from "./application/shared/infrastructure/InMemoryUserRepository.js";
import { InMemoryRefreshTokenRepository } from "./application/shared/infrastructure/InMemoryRefreshTokenRepository.js";
import { ENVIROMENT_VARIABLES } from "./application/shared/infrastructure/EnviromentVariables.js";

// Initialize adapters (infrastructure layer)
const userRepository = new InMemoryUserRepository();
const refreshTokenRepository = new InMemoryRefreshTokenRepository();
const cryptoService = new Argon2CryptoService();
const tokenService = new JwtTokenService(
  ENVIROMENT_VARIABLES.ACCESS_TOKEN_SECRET,
  ENVIROMENT_VARIABLES.REFRESH_TOKEN_SECRET,
  "15m",
  "7d",
);

// Initialize use cases with dependency injection
const signUpUseCase = new SignUpUseCase(userRepository, cryptoService);
const loginUseCase = new LoginUseCase(
  userRepository,
  cryptoService,
  tokenService,
  refreshTokenRepository,
);
const refreshTokenUseCase = new RefreshTokenUseCase(
  userRepository,
  tokenService,
  refreshTokenRepository,
);

// Initialize controllers
const signUpController = new SignUpController(signUpUseCase);
const loginController = new LoginController(loginUseCase);
const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use(
  "/api/auth",
  createAuthRoutes(signUpController, loginController, refreshTokenController),
);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling for 404
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Not found",
  });
});

// Start server
app.listen(ENVIROMENT_VARIABLES.PORT, () => {
  console.log(
    `✓ Authentication service running on http://localhost:${ENVIROMENT_VARIABLES.PORT}`,
  );
  console.log(`✓ Available endpoints:`);
  console.log(`  POST /api/auth/sign-up`);
  console.log(`  POST /api/auth/login`);
  console.log(`  POST /api/auth/refresh-token`);
  console.log(`  GET  /health`);
});
