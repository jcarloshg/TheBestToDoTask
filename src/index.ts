import "dotenv/config";
import express from "express";
import { createAuthRoutes } from "./presentation/routes/authRoutes";
import { ENVIROMENT_VARIABLES } from "./application/shared/infrastructure/EnviromentVariables";

// Create Express app
const app = express();

// Middleware
app.use(express.json());

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
    message: "Not found",
  });
});

// Start server
app.listen(ENVIROMENT_VARIABLES.PORT, () => {
  console.log(
    `✓ Authentication service running on http://localhost:${ENVIROMENT_VARIABLES.PORT}`,
  );
  console.log(`✓ Available endpoints:`);
  console.log(`  POST /api/auth/sign-up`);
  console.log(`  POST /api/auth/login`);
  console.log(`  POST /api/auth/refresh-token`);
  console.log(`  GET  /health`);
});
