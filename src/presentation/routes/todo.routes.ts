import { Express, Router } from "express";
import { CreateToDoController } from "../controllers/CreateToDoController";
import { UpdateToDoController } from "../controllers/UpdateToDoController";
import { GetToDoByIdController } from "../controllers/GetToDoByIdController";
import { validateRequest } from "../middlewares/ValidationMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { CreateToDoRequestSchema } from "../../application/todo/create-todo/models/CreateToDoDto";
import { UpdateToDoRequestSchema } from "../../application/todo/update-todo/models/UpdateToDoDto";

export const TodoRoutes = (app: Express) => {
  const router = Router();

  // Create a new todo
  router.post(
    "/create",
    authMiddleware,
    validateRequest(CreateToDoRequestSchema),
    async (req, res) => await CreateToDoController(req, res),
  );

  // Update a todo by id
  router.patch(
    "/update/:id",
    authMiddleware,
    validateRequest(UpdateToDoRequestSchema),
    async (req, res) => await UpdateToDoController(req, res),
  );

  // Get a todo by id
  router.get(
    "/list/:id",
    authMiddleware,
    async (req, res) => await GetToDoByIdController(req, res),
  );

  app.use("/v1/todo", router);
};
