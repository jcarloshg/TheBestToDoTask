import { Express, Router } from "express";
import { CreateToDoController } from "../controllers/CreateToDoController";
import { validateRequest } from "../middlewares/ValidationMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { CreateToDoRequestSchema } from "../../application/todo/create-todo/models/CreateToDoDto";

export const TodoRoutes = (app: Express) => {
  const router = Router();

  router.post(
    "/create",
    authMiddleware,
    validateRequest(CreateToDoRequestSchema),
    async (req, res) => await CreateToDoController(req, res),
  );

  app.use("/v1/todo", router);
};
