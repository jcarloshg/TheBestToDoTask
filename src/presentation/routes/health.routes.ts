import { Express, Router } from "express";

export const HealthRoutes = (app: Express) => {
    const router = Router();

    // Health check
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
