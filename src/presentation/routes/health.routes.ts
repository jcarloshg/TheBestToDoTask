import { Express, Router } from "express";

export const HealthRoutes = (app: Express) => {
    const router = Router();

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check endpoint
     *     tags:
     *       - Health
     *     description: Check if the API is running and healthy
     *     responses:
     *       200:
     *         description: API is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: ok
     */
    router.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    // Error handling for 404
    router.use((_req, res) => {
        res.status(404).json({
            status: "error",
            message: "path/resource not found",
        });
    });

    app.use("", router);
};
