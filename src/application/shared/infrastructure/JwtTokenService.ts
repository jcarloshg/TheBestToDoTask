import jwt, { SignOptions } from "jsonwebtoken";
import { ITokenService, TokenPayload } from "../models/ITokenService";

export class JwtTokenServiceSingleton implements ITokenService {
  private static instance: JwtTokenServiceSingleton | null = null;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  private constructor(
    accessTokenSecret: string,
    refreshTokenSecret: string,
    accessTokenExpiry: string = "15m",
    refreshTokenExpiry: string = "7d",
  ) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.accessTokenExpiry = accessTokenExpiry;
    this.refreshTokenExpiry = refreshTokenExpiry;
  }

  static getInstance(
    accessTokenSecret: string,
    refreshTokenSecret: string,
    accessTokenExpiry: string = "15m",
    refreshTokenExpiry: string = "7d",
  ): JwtTokenServiceSingleton {
    if (!JwtTokenServiceSingleton.instance) {
      JwtTokenServiceSingleton.instance = new JwtTokenServiceSingleton(
        accessTokenSecret,
        refreshTokenSecret,
        accessTokenExpiry,
        refreshTokenExpiry,
      );
    }
    return JwtTokenServiceSingleton.instance;
  }

  generateAccessToken(payload: Omit<TokenPayload, "type">): string {
    const options: SignOptions = {
      expiresIn: this.accessTokenExpiry as unknown as number,
    };
    return jwt.sign(
      { ...payload, type: "access" },
      this.accessTokenSecret,
      options,
    );
  }

  generateRefreshToken(payload: Omit<TokenPayload, "type">): string {
    const options: SignOptions = {
      expiresIn: this.refreshTokenExpiry as unknown as number,
    };
    return jwt.sign(
      { ...payload, type: "refresh" },
      this.refreshTokenSecret,
      options,
    );
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      return decoded.type === "access" ? decoded : null;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        this.refreshTokenSecret,
      ) as TokenPayload;
      return decoded.type === "refresh" ? decoded : null;
    } catch {
      return null;
    }
  }
}
