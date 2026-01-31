import express from "express";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { AuthRoutes } from "./presentation/routes/auth.routes";
import { TodoRoutes } from "./presentation/routes/todo.routes";
import { ENVIROMENT_VARIABLES } from "./application/shared/infrastructure/EnviromentVariables";
import { HealthRoutes } from "./presentation/routes/health.routes";
import SequelizeSingleton from "./application/shared/sequelize";
import { swaggerSpec } from "./presentation/swagger/swaggerConfig";

// Create Express app && Middlewares
const app = express();
app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
AuthRoutes(app);
TodoRoutes(app);
HealthRoutes(app);

// Start server
app.listen(ENVIROMENT_VARIABLES.PORT, async () => {
  try {
    // Print startup header
    console.log("\n");
    console.log("║                   🚀 ToDo API Server Starting 🚀                    ║");
    console.log("");

    // Initialize database connection
    console.log("📡 Connecting to database...");
    await SequelizeSingleton.connect();
    console.log("✅ Database connection established successfully\n");

    // Print server information
    const baseUrl = `http://localhost:${ENVIROMENT_VARIABLES.PORT}`;
    const swaggerUrl = `${baseUrl}/api-docs`;


    console.log("║                      ✨ Server Ready! ✨                            ║");
    console.log("");

    console.log("📍 Server Information:");
    console.log(`   • API Base URL:        ${baseUrl}`);
    console.log(`   • Environment:         ${process.env.NODE_ENV || 'development'}`);
    console.log("");

    console.log("📚 API Documentation:");
    console.log(`   • Swagger UI:          ${swaggerUrl}`);
    console.log("");


    console.log("║              Press Ctrl+C to stop the server                       ║");
    console.log("");
  } catch (error) {
    console.error("\n❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
});
