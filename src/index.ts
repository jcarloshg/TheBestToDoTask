import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createAuthRoutes } from "./presentation/routes/authRoutes";
import { ENVIROMENT_VARIABLES } from "./application/shared/infrastructure/EnviromentVariables";
import SequelizeSingleton from "./application/shared/sequelize";
import { HealthRoutes } from "./presentation/routes/health.routes";

// Create Express app && Middlewares
const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
createAuthRoutes(app);
HealthRoutes(app);

// Start server
app.listen(ENVIROMENT_VARIABLES.PORT, async () => {
  // Initialize database connection
  console.log("Connecting to database...");
  await SequelizeSingleton.connect();

  console.log(
    `✓ Authentication service running on http://localhost:${ENVIROMENT_VARIABLES.PORT}`,
  );
});
