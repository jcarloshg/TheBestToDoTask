import express from "express";
import cookieParser from "cookie-parser";
import { createAuthRoutes } from "./presentation/routes/auth.routes";
import { TodoRoutes } from "./presentation/routes/todo.routes";
import { ENVIROMENT_VARIABLES } from "./application/shared/infrastructure/EnviromentVariables";
import { HealthRoutes } from "./presentation/routes/health.routes";
import SequelizeSingleton from "./application/shared/sequelize";

// Create Express app && Middlewares
const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
createAuthRoutes(app);
TodoRoutes(app);
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
