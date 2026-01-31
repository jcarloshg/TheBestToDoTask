import { Request, Response } from "express";
import { GetAllTodosUseCase } from "../../application/todo/get-all-todos/application/GetAllTodosUseCase";
import { GetAllTodosQuery } from "../../application/todo/get-all-todos/models/GetAllTodosDto";
import { ToDoRepoPostgreSqlImp } from "../../application/shared/sequelize/ToDoRepoPostgreSql";

export const GetAllTodosController = async (
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

    // Get query parameters (already validated by middleware)
    const query: GetAllTodosQuery = {
      priority: req.query.priority as any,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    // Init dependencies
    const toDoRepository = ToDoRepoPostgreSqlImp;

    // Init use cases
    const getAllTodosUseCase = new GetAllTodosUseCase(toDoRepository);

    // Process request
    const response = await getAllTodosUseCase.execute(userId, query);

    res.status(200).json({
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
