import { Request, Response } from "express";
import { GetUserUseCase } from "../../application/auth/get-user/application/GetUserUseCase";
import { GetUserRepositoryInstance } from "../../application/shared/models/IUserRepository";

export const GetUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get userId from auth middleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "User ID not found in request",
      });
      return;
    }

    // Initialize dependencies
    const userRepository = GetUserRepositoryInstance();
    const getUserUseCase = new GetUserUseCase(userRepository);

    // Get user information
    const user = await getUserUseCase.execute(userId);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";

    res.status(404).json({
      status: "error",
      message,
    });
  }
};
