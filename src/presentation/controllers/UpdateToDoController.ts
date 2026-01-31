import { Request, Response } from "express";
import { UpdateToDoUseCase } from "../../application/todo/update-todo/application/UpdateToDoUseCase";
import { UpdateToDoRequest } from "../../application/todo/update-todo/models/UpdateToDoDto";
import { ToDoRepoPostgreSqlImp } from "../../application/shared/sequelize/ToDoRepoPostgreSql";

export const UpdateToDoController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {

    // Get userId from auth middleware
    const userId = req.userId;
    const todoId = req.params.id;

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "User ID not found in request",
      });
      return;
    }

    if (!todoId) {
      res.status(400).json({
        status: "error",
        message: "Todo ID is required",
      });
      return;
    }

    // Init dependencies
    const toDoRepository = ToDoRepoPostgreSqlImp;

    // Init use cases
    const updateToDoUseCase = new UpdateToDoUseCase(toDoRepository);

    // Process request
    const request: UpdateToDoRequest = req.body;
    const response = await updateToDoUseCase.execute(userId, todoId, request);

    res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";

    if (message.includes("not found") || message.includes("Unauthorized")) {
      res.status(404).json({
        status: "error",
        message,
      });
    } else {
      res.status(400).json({
        status: "error",
        message,
      });
    }
  }
};
