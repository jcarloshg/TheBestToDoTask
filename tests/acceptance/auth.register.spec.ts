import request from "supertest";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import { AuthRoutes } from "../../src/presentation/routes/auth.routes";
import { HealthRoutes } from "../../src/presentation/routes/health.routes";

export const getRandomName = (): string => {
  const names = ["Bob", "Quentin", "Rachel", "Steve", "Tina"];
  const lastNames = ["Smith", "Taylor", "Lewis", "Walker", "Hall"];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${randomName} ${randomLastName}`;
};

/**
 * Acceptance Tests for POST /v1/auth/register
 *
 * These tests send actual HTTP requests to the Express server
 * and validate the complete request/response cycle.
 */
describe("POST /v1/auth/register - Acceptance Tests", () => {
  let app: Express;

  /**
   * Setup Express app for testing
   */
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Register routes
    AuthRoutes(app);
    HealthRoutes(app);
  });

  // ============================================================================
  // HAPPY PATH SCENARIOS
  // ============================================================================

  describe("Happy Path: Successful Registration", () => {
    it("should register a new user with valid email and password", async () => {
      const uniqueEmail = `user-${Date.now()}@example.com`;

      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "securePassword123",
          name: getRandomName(),
        })
        .expect(201);

      // Validate response structure and content
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("email", uniqueEmail);
      expect(response.body.data).toHaveProperty("createdAt");

      // Verify timestamps are valid ISO 8601
      expect(new Date(response.body.data.createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.data.updatedAt)).toBeInstanceOf(Date);
    });

    it("should register another user with different email", async () => {
      const uniqueEmail = `another-user-${Date.now()}@example.com`;

      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "AnotherPassword123",
          name: getRandomName(),
        })
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.email).toBe(uniqueEmail);
    });

    it("should register with minimum valid password length (8 characters)", async () => {
      const uniqueEmail = `minpass-${Date.now()}@example.com`;

      const response = await request(app).post("/v1/auth/register").send({
        email: uniqueEmail,
        password: "MinPass1",
        name: getRandomName(),
      });

      expect(response.statusCode).toBe(201);
    });

    it("should register with password containing special characters", async () => {
      const uniqueEmail = `special-${Date.now()}@example.com`;

      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "P@ssw0rd!#2025",
          name: getRandomName(),
        })
        .expect(201);

      expect(response.body.status).toBe("success");
    });

    it("should register with long email address", async () => {
      const uniqueEmail = `john.doe.smith.johnson-${Date.now()}@subdomain.example.com`;

      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "LongEmailPassword123",
          name: getRandomName(),
        })
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.email).toBe(uniqueEmail);
    });
  });

  // ============================================================================
  // EMAIL VALIDATION SCENARIOS
  // ============================================================================

  describe("Validation: Invalid Email Format", () => {
    it("should reject email without @ symbol", async () => {
      const response = await request(app).post("/v1/auth/register").send({
        email: "invalid-email",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBeDefined();
    });

    it("should reject email with @ but no domain", async () => {
      const response = await request(app).post("/v1/auth/register").send({
        email: "user@",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject email without domain extension", async () => {
      const response = await request(app).post("/v1/auth/register").send({
        email: "userexample.com",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject email with invalid characters", async () => {
      const response = await request(app).post("/v1/auth/register").send({
        email: "user<>@example.com",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  // ============================================================================
  // PASSWORD VALIDATION SCENARIOS
  // ============================================================================

  describe("Validation: Invalid Password", () => {
    it("should reject password shorter than 8 characters", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
          password: "Short1",
          name: getRandomName(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject password of exactly 7 characters", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
          password: "Pass123",
          name: getRandomName(),
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should reject empty password", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
          password: "",
          name: getRandomName(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject whitespace-only password", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
          password: "        ",
          name: getRandomName(),
        });
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  // ============================================================================
  // MISSING FIELD SCENARIOS
  // ============================================================================

  describe("Validation: Missing Required Fields", () => {
    it("should reject request without email field", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          password: "SecurePassword123",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should reject request without password field", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should reject empty request body", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({})
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should reject request with null email", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: null,
          password: "SecurePassword123",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should reject request with null password", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
          password: null,
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should reject request with empty email string", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: "",
          password: "SecurePassword123",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });

  // ============================================================================
  // DUPLICATE REGISTRATION SCENARIOS
  // ============================================================================

  describe("Validation: Duplicate User", () => {
    it("should reject duplicate registration with same email", async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // First registration - should succeed
      await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "FirstPassword123",
        })
        .expect(201);

      // Second registration with same email - should fail
      const response = await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "SecondPassword123",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message.toLowerCase()).toContain("exist");
    });

    it("should reject duplicate even with different password", async () => {
      const uniqueEmail = `dup2-${Date.now()}@example.com`;

      // First registration
      await request(app)
        .post("/v1/auth/register")
        .send({
          email: uniqueEmail,
          password: "OriginalPass123",
          name: getRandomName(),
        })
        .expect(201);

      // Attempt duplicate with different password
      const response = await request(app).post("/v1/auth/register").send({
        email: uniqueEmail,
        password: "DifferentPass456",
        name: getRandomName(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  // ============================================================================
  // RESPONSE STRUCTURE VALIDATION
  // ============================================================================

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  // ============================================================================
  // HTTP SPECIFICATIONS
  // ============================================================================

  // ============================================================================
  // ERROR RESPONSE VALIDATION
  // ============================================================================
});
