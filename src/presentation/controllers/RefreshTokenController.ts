import { Request, Response } from "express";
import { RefreshTokenUseCase } from "../../application/auth/refresh-token/application/RefreshTokenUseCase";
import { RefreshTokenRequest } from "../../application/auth/refresh-token/models/RefreshTokenDto";
import { GetUserRepositoryInstance } from "../../application/shared/models/IUserRepository";
import { JwtTokenServiceSingleton } from "../../application/shared/infrastructure/JwtTokenService";
import { InMemoryRefreshTokenRepository } from "../../application/shared/infrastructure/InMemoryRefreshTokenRepository";
import { ENVIROMENT_VARIABLES } from "../../application/shared/infrastructure/EnviromentVariables";

export const RefreshTokenController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // init dependencies
    const userRepository = GetUserRepositoryInstance();
    const tokenService = JwtTokenServiceSingleton.getInstance(
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_EXPIRY,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_EXPIRY,
    );
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();

    // init use cases
    const refreshTokenUseCase = new RefreshTokenUseCase(
      userRepository,
      tokenService,
      refreshTokenRepository,
    );

    // process request
    const request: RefreshTokenRequest = req.body;
    const response = await refreshTokenUseCase.execute(request);

    res.status(200).json({
      status: "success",
      data: response,
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
