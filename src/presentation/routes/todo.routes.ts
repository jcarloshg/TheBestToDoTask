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

  /**
   * @swagger
   * /v1/todo/create:
   *   post:
   *     summary: Create a new todo
   *     tags:
   *       - Todos
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - priority
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *                 example: Complete project
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high]
   *                 example: high
   *     responses:
   *       201:
   *         description: Todo created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/Todo'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    "/create",
    authMiddleware,
    validateRequest(CreateToDoRequestSchema),
    async (req, res) => await CreateToDoController(req, res),
  );

  /**
   * @swagger
   * /v1/todo/list:
   *   get:
   *     summary: Get all todos with filters and pagination
   *     tags:
   *       - Todos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high]
   *         description: Filter todos by priority
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Todos retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/PaginatedTodos'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    "/list",
    authMiddleware,
    validateQuery(GetAllTodosQuerySchema),
    async (req, res) => await GetAllTodosController(req, res),
  );

  /**
   * @swagger
   * /v1/todo/list/{id}:
   *   get:
   *     summary: Get a todo by ID
   *     tags:
   *       - Todos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Todo ID
   *     responses:
   *       200:
   *         description: Todo retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/Todo'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    "/list/:id",
    authMiddleware,
    async (req, res) => await GetToDoByIdController(req, res),
  );

  /**
   * @swagger
   * /v1/todo/list/{id}:
   *   patch:
   *     summary: Update a todo
   *     tags:
   *       - Todos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Todo ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high]
   *               completed:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Todo updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/Todo'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch(
    "/list/:id",
    authMiddleware,
    validateRequest(UpdateToDoRequestSchema),
    async (req, res) => await UpdateToDoController(req, res),
  );

  /**
   * @swagger
   * /v1/todo/list/{id}:
   *   delete:
   *     summary: Delete a todo
   *     tags:
   *       - Todos
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Todo ID
   *     responses:
   *       200:
   *         description: Todo deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: Todo deleted
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Todo not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete(
    "/list/:id",
    authMiddleware,
    async (req, res) => await DeleteToDoByIdController(req, res),
  );

  app.use("/v1/todo", router);
};
