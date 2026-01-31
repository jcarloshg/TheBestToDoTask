import { Request, Response } from "express";
import { CreateToDoUseCase } from "../../application/todo/create-todo/application/CreateToDoUseCase";
import { CreateToDoRequest } from "../../application/todo/create-todo/models/CreateToDoDto";
import { ToDoRepoPostgreSqlImp } from "../../application/shared/sequelize/ToDoRepoPostgreSql";

export const CreateToDoController = async (
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

    // Init dependencies
    const toDoRepository = ToDoRepoPostgreSqlImp;

    // Init use cases
    const createToDoUseCase = new CreateToDoUseCase(toDoRepository);

    // Process request
    const request: CreateToDoRequest = req.body;
    const response = await createToDoUseCase.execute(userId, request);

    res.status(201).json({
      status: "success",
      data: response,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";

    res.status(400).json({
      status: "error",
      message,
    });
  }
};
