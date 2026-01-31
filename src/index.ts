import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createAuthRoutes } from "./presentation/routes/authRoutes";
import { ENVIROMENT_VARIABLES } from "./application/shared/infrastructure/EnviromentVariables";
import SequelizeSingleton from "./application/shared/sequelize";

// Create Express app && Middlewares
const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
createAuthRoutes(app);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling for 404
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "path/resource not found",
  });
});

// Start server
app.listen(ENVIROMENT_VARIABLES.PORT, async () => {

  // Initialize database connection
  await SequelizeSingleton.connect();

  console.log(
    `✓ Authentication service running on http://localhost:${ENVIROMENT_VARIABLES.PORT}`,
  );
});
