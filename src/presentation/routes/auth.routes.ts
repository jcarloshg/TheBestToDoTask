import { Express, Router } from "express";
import { SignUpController } from "../controllers/SignUpController";
import { LoginController } from "../controllers/LoginController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { GetUserController } from "../controllers/GetUserController";
import { validateRequest } from "../middlewares/ValidationMiddleware";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { SignUpRequestSchema } from "../../application/auth/sign-up/models/SignUpDto";
import { LoginRequestSchema } from "../../application/auth/login/models/LoginDto";

export function AuthRoutes(app: Express) {
  const router = Router();

  /**
   * @swagger
   * /v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: securePassword123
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     email:
   *                       type: string
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Validation error or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    "/register",
    validateRequest(SignUpRequestSchema),
    async (req, res) => await SignUpController(req, res),
  );

  /**
   * @swagger
   * /v1/auth/login:
   *   post:
   *     summary: Login user
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: securePassword123
   *     responses:
   *       200:
   *         description: Login successful
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: string
   *               example: refreshToken=abcdef123456; HttpOnly; Secure; SameSite=Strict
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    "/login",
    validateRequest(LoginRequestSchema),
    async (req, res) => await LoginController(req, res),
  );

  /**
   * @swagger
   * /v1/auth/refresh-token:
   *   post:
   *     summary: Refresh access token
   *     tags:
   *       - Authentication
   *     description: Requires refresh token in HTTP-only cookie
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: string
   *               example: refreshToken=abcdef123456; HttpOnly; Secure; SameSite=Strict
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *       401:
   *         description: Refresh token not found or expired
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    "/refresh-token",
    // No validation needed - refresh token comes from HTTP-only cookie
    async (req, res) => await RefreshTokenController(req, res),
  );

  /**
   * @swagger
   * /v1/auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags:
   *       - Authentication
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized - invalid or missing token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    "/me",
    authMiddleware,
    async (req, res) => await GetUserController(req, res),
  );

  app.use("/v1/auth", router);
}
