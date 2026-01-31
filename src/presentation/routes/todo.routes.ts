import { Express, Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";

export const TodoRoutes = (app: Express) => {
    const router = Router();

    router.post(
        "/create",
        authMiddleware
    );


    app.use("/v1/todo", router);

}