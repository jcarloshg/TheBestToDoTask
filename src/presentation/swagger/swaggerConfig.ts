import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Get __dirname in ES modules
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Determine the correct API path based on environment
 * In development, use src files
 * In production (dist build), use compiled files
 */
const getApiPaths = (): string[] => {
  const isDist = __dirname.includes("dist");
  if (isDist) {
    return [path.join(__dirname, "../**/*.js")];
  }
  return ["./src/presentation/routes/*.ts"];
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ToDo API Documentation",
      version: "1.0.0",
      description:
        "Production-ready ToDo API with JWT Authentication Service. Features include user registration/login, todo CRUD operations with pagination and filtering, and secure token-based authentication.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development Server",
      },
      {
        url: "https://api.example.com",
        description: "Production Server",
        variables: {
          port: {
            default: "443",
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token for authentication. Token expires in 15 minutes.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["error"],
              example: "error",
              description: "Status indicator for error response",
            },
            message: {
              type: "string",
              example: "Validation error or server error message",
              description: "Detailed error message",
            },
            data: {
              type: "object",
              description: "Additional error details if available",
            },
          },
          required: ["status"],
        },
        Success: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["success"],
              example: "success",
              description: "Status indicator for successful response",
            },
            data: {
              type: "object",
              description: "Response data payload",
            },
          },
          required: ["status", "data"],
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique user identifier",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when user was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when user was last updated",
            },
          },
          required: ["id", "email", "name", "createdAt", "updatedAt"],
        },
        Todo: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique todo identifier",
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description: "Todo title or name",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Priority level of the todo",
            },
            completed: {
              type: "boolean",
              description: "Whether the todo is completed",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "ID of the user who owns this todo",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when todo was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when todo was last updated",
            },
          },
          required: ["id", "name", "priority", "completed", "userId", "createdAt", "updatedAt"],
        },
        PaginatedTodos: {
          type: "object",
          properties: {
            todos: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Todo",
              },
              description: "Array of todo items for the current page",
            },
            total: {
              type: "integer",
              minimum: 0,
              description: "Total number of todos matching the filter criteria",
            },
            page: {
              type: "integer",
              minimum: 1,
              description: "Current page number (1-based indexing)",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Number of items per page",
            },
            totalPages: {
              type: "integer",
              minimum: 0,
              description: "Total number of pages available",
            },
          },
          required: ["todos", "total", "page", "limit", "totalPages"],
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Todo",
        description: "Todo management endpoints (CRUD operations)",
      },
      {
        name: "Health",
        description: "System health check endpoints",
      },
    ],
  },
  apis: getApiPaths(),
};

export const swaggerSpec = swaggerJsdoc(options);
