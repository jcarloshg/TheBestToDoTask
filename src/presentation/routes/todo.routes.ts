import { Express, Router } from "express";
import { CreateToDoController } from "../controllers/CreateToDoController";
import { UpdateToDoController } from "../controllers/UpdateToDoController";
import { GetToDoByIdController } from "../controllers/GetToDoByIdController";
import { DeleteToDoByIdController } from "../controllers/DeleteToDoByIdController";
import { GetAllTodosController } from "../controllers/GetAllTodosController";
import { validateRequest, validateQuery } from "../middlewares/ValidationMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { CreateToDoRequestSchema } from "../../application/todo/create-todo/models/CreateToDoDto";
import { UpdateToDoRequestSchema } from "../../application/todo/update-todo/models/UpdateToDoDto";
import { GetAllTodosQuerySchema } from "../../application/todo/get-all-todos/models/GetAllTodosDto";

export const TodoRoutes = (app: Express) => {
  const router = Router();

  router.post(
    "/create",
    authMiddleware,
    validateRequest(CreateToDoRequestSchema),
    async (req, res) => await CreateToDoController(req, res),
  );

  router.patch(
    "/list/:id",
    authMiddleware,
    validateRequest(UpdateToDoRequestSchema),
    async (req, res) => await UpdateToDoController(req, res),
  );

  router.get(
    "/list/:id",
    authMiddleware,
    async (req, res) => await GetToDoByIdController(req, res),
  );

  // Get todos with priority filter and pagination
  router.get(
    "/list",
    authMiddleware,
    validateQuery(GetAllTodosQuerySchema),
    async (req, res) => await GetAllTodosController(req, res),
  );

  router.delete(
    "/list/:id",
    authMiddleware,
    async (req, res) => await DeleteToDoByIdController(req, res),
  );

  app.use("/v1/todo", router);
};
