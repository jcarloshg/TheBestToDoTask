import { Request, Response } from "express";
import { RefreshTokenUseCase } from "../../application/auth/refresh-token/application/RefreshTokenUseCase";
import { RefreshTokenRequest } from "../../application/auth/refresh-token/models/RefreshTokenDto";
import { GetUserRepositoryInstance } from "../../application/shared/models/IUserRepository";
import { JwtTokenServiceSingleton } from "../../application/shared/infrastructure/JwtTokenService";
import { ENVIROMENT_VARIABLES } from "../../application/shared/infrastructure/EnviromentVariables";
import { GetRefreshTokenRepositoryInstance } from "../../application/shared/models/IRefreshTokenRepository";

export const RefreshTokenController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        status: "error",
        message: "Refresh token not found. Please login again.",
      });
      return;
    }

    // init dependencies
    const userRepository = GetUserRepositoryInstance();
    const refreshTokenRepository = GetRefreshTokenRepositoryInstance();
    const tokenService = JwtTokenServiceSingleton.getInstance(
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_EXPIRY,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_EXPIRY,
    );

    // init use cases
    const refreshTokenUseCase = new RefreshTokenUseCase(
      userRepository,
      tokenService,
      refreshTokenRepository,
    );

    // process request
    const request: RefreshTokenRequest = { refreshToken };
    const { refreshToken: newRefreshToken, ...responseWithoutRefreshToken } =
      await refreshTokenUseCase.execute(request);

    // Clear old refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: ENVIROMENT_VARIABLES.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Set new refresh token as HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: ENVIROMENT_VARIABLES.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Return only access token in response body
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
