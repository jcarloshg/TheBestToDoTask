import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ToDo API Documentation",
      version: "1.0.0",
      description: "Production-ready ToDo API with Authentication Service",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token for authentication",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            email: {
              type: "string",
              format: "email",
            },
            name: {
              type: "string",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Todo: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH"],
            },
            completed: {
              type: "boolean",
            },
            userId: {
              type: "string",
              format: "uuid",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        PaginatedTodos: {
          type: "object",
          properties: {
            todos: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Todo",
              },
            },
            total: {
              type: "integer",
            },
            page: {
              type: "integer",
            },
            limit: {
              type: "integer",
            },
            totalPages: {
              type: "integer",
            },
          },
        },
      },
    },
  },
  apis: ["./src/presentation/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
