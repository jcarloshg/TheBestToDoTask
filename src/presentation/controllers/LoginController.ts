import { Request, Response } from "express";
import { LoginUseCase } from "../../application/auth/login/application/LoginUseCase";
import { LoginRequest } from "../../application/auth/login/models/LoginDto";
import { GetUserRepositoryInstance } from "../../application/shared/models/IUserRepository";
import { Argon2CryptoService } from "../../application/shared/infrastructure/Argon2CryptoService";
import { JwtTokenServiceSingleton } from "../../application/shared/infrastructure/JwtTokenService";
import { InMemoryRefreshTokenRepository } from "../../application/shared/infrastructure/InMemoryRefreshTokenRepository";
import { ENVIROMENT_VARIABLES } from "../../application/shared/infrastructure/EnviromentVariables";

export const LoginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // init dependencies
    const userRepository = GetUserRepositoryInstance();
    const argon2CryptoService = new Argon2CryptoService();
    const tokenService = JwtTokenServiceSingleton.getInstance(
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_EXPIRY,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_EXPIRY,
    );
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();

    // init use cases
    const loginUseCase = new LoginUseCase(
      userRepository,
      argon2CryptoService,
      tokenService,
      refreshTokenRepository,
    );

    // process request
    const request: LoginRequest = req.body;
    const { refreshToken, ...responseWithoutRefreshToken } = await loginUseCase.execute(request);

    // Set refresh token as HTTP-only cookie (secure way to handle refresh tokens)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENVIROMENT_VARIABLES.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Return access token in response body
    res.status(200).json({
      status: "success",
      data: responseWithoutRefreshToken,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";

    res.status(401).json({
      status: "error",
      message,
    });
  }
};
