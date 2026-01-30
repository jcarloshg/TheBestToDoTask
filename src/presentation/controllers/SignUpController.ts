import { Request, Response } from "express";
import { SignUpUseCase } from "../../application/auth/sign-up/application/SignUpUseCase";
import { SignUpRequest } from "../../application/auth/sign-up/models/SignUpDto";
import { GetUserRepositoryInstance } from "../../application/shared/models/IUserRepository";
import {
  Argon2CryptoService,
  Argon2CryptoServiceImp,
} from "../../application/shared/infrastructure/Argon2CryptoService";

export class SignUpController {
  constructor() {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      // init dependencies
      const userRepository = GetUserRepositoryInstance(); // check dev, prod, etc
      const argon2CryptoService = new Argon2CryptoService();

      // init use cases
      const signUpUseCase = new SignUpUseCase(
        userRepository,
        argon2CryptoService,
      );

      // process request
      const request: SignUpRequest = req.body;
      const response = await signUpUseCase.execute(request);

      res.status(201).json({
        status: "success",
        data: response,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";

      if (message.includes("already exists")) {
        res.status(409).json({
          status: "error",
          message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message,
        });
      }
    }
  }
}
