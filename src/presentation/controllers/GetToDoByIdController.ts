import { Request, Response } from "express";
import { GetToDoByIdUseCase } from "../../application/todo/get-todo-by-id/application/GetToDoByIdUseCase";
import { ToDoRepoPostgreSqlImp } from "../../application/shared/sequelize/ToDoRepoPostgreSql";

export const GetToDoByIdController = async (
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
    const getToDoByIdUseCase = new GetToDoByIdUseCase(toDoRepository);

    // Process request
    const response = await getToDoByIdUseCase.execute(userId, todoId);

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
