import { Request, Response, NextFunction } from "express";
import { JwtTokenServiceSingleton } from "../../application/shared/infrastructure/JwtTokenService";
import { ENVIROMENT_VARIABLES } from "../../application/shared/infrastructure/EnviromentVariables";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "Missing or invalid authorization header",
      });
      return;
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the token
    const tokenService = JwtTokenServiceSingleton.getInstance(
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_SECRET,
      ENVIROMENT_VARIABLES.ACCESS_TOKEN_EXPIRY,
      ENVIROMENT_VARIABLES.REFRESH_TOKEN_EXPIRY,
    );

    const payload = tokenService.verifyAccessToken(accessToken);

    if (!payload) {
      res.status(401).json({
        status: "error",
        message: "Invalid or expired access token",
      });
      return;
    }

    // Attach user info to request
    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed";

    res.status(401).json({
      status: "error",
      message,
    });
  }
};
