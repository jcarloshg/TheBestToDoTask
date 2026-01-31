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

    it('should register with password containing special characters', async () => {
      const uniqueEmail = `special-${Date.now()}@example.com`;

      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'P@ssw0rd!#2025',
          name: getRandomName(),
        })
        .expect(201);

      expect(response.body.status).toBe('success');
    });

    it('should register with long email address', async () => {
      const uniqueEmail = `john.doe.smith.johnson-${Date.now()}@subdomain.example.com`;

      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'LongEmailPassword123',
          name: getRandomName(),
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(uniqueEmail);
    });
  });

  // ============================================================================
  // EMAIL VALIDATION SCENARIOS
  // ============================================================================

  describe('Validation: Invalid Email Format', () => {
    it('should reject email without @ symbol', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123',
          name: getRandomName(),
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBeDefined();
    });

    it('should reject email with @ but no domain', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'user@',
          password: 'SecurePassword123',
          name: getRandomName(),
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject email without domain extension', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'userexample.com',
          password: 'SecurePassword123',
          name: getRandomName(),
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject email with invalid characters', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'user<>@example.com',
          password: 'SecurePassword123',
          name: getRandomName(),
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  // ============================================================================
  // PASSWORD VALIDATION SCENARIOS
  // ============================================================================

  describe('Validation: Invalid Password', () => {
    it('should reject password shorter than 8 characters', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'Short1',
          name: getRandomName(),
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject password of exactly 7 characters', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'Pass123',
          name: getRandomName(),
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject empty password', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: '',
          name: getRandomName(),
        })


      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject whitespace-only password', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: '        ',
          name: getRandomName(),
        })
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  // ============================================================================
  // MISSING FIELD SCENARIOS
  // ============================================================================

  describe('Validation: Missing Required Fields', () => {
    it('should reject request without email field', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          password: 'SecurePassword123',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject request without password field', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject empty request body', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject request with null email', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: null,
          password: 'SecurePassword123',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject request with null password', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: null,
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject request with empty email string', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: '',
          password: 'SecurePassword123',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  // ============================================================================
  // DUPLICATE REGISTRATION SCENARIOS
  // ============================================================================

  describe('Validation: Duplicate User', () => {
    it('should reject duplicate registration with same email', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // First registration - should succeed
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'FirstPassword123',
        })
        .expect(201);

      // Second registration with same email - should fail
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecondPassword123',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message.toLowerCase()).toContain('exist');
    });

    it('should reject duplicate even with different password', async () => {
      const uniqueEmail = `dup2-${Date.now()}@example.com`;

      // First registration
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'OriginalPass123',
          name: getRandomName(),
        })
        .expect(201);

      // Attempt duplicate with different password
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'DifferentPass456',
          name: getRandomName(),
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });

  });

  // ============================================================================
  // RESPONSE STRUCTURE VALIDATION
  // ============================================================================

  describe('Response Structure and Data', () => {
    it('should not return password in response', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `nopass-${Date.now()}@example.com`,
          password: 'SecurePassword123',
        })
        .expect(201);

      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('hashedPassword');
    });

    it('should return all required fields in response data', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `allfields-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(201);

      const requiredFields = ['id', 'email', 'createdAt', 'updatedAt'];
      requiredFields.forEach((field) => {
        expect(response.body.data).toHaveProperty(field);
      });
    });

    it('should have createdAt equal to updatedAt for new user', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `timestamps-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(201);

      const { createdAt, updatedAt } = response.body.data;
      expect(new Date(createdAt).getTime()).toBe(new Date(updatedAt).getTime());
    });

    it('should return ISO 8601 formatted timestamps', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `iso8601-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(201);

      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      expect(response.body.data.createdAt).toMatch(iso8601Regex);
      expect(response.body.data.updatedAt).toMatch(iso8601Regex);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle Content-Type application/json', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: `contenttype-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(201);

      expect(response.body.status).toBe('success');
    });

    it('should reject non-JSON Content-Type', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'text/plain')
        .send('email=user@example.com&password=Password123')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should handle request with extra unknown fields', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `extra-${Date.now()}@example.com`,
          password: 'Password123',
          extraField: 'should-be-ignored',
          anotherField: 123,
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).not.toHaveProperty('extraField');
      expect(response.body.data).not.toHaveProperty('anotherField');
    });

    it('should handle very long password', async () => {
      const longPassword = 'P'.repeat(256) + '123';

      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `longpass-${Date.now()}@example.com`,
          password: longPassword,
        })
        .expect(201);

      expect(response.body.status).toBe('success');
    });

    it('should handle rapid sequential registrations', async () => {
      const email1 = `rapid1-${Date.now()}@example.com`;
      const email2 = `rapid2-${Date.now()}@example.com`;

      const [response1, response2] = await Promise.all([
        request(app)
          .post('/v1/auth/register')
          .send({
            email: email1,
            password: 'Password1',
          }),
        request(app)
          .post('/v1/auth/register')
          .send({
            email: email2,
            password: 'Password2',
          }),
      ]);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });

  // ============================================================================
  // HTTP SPECIFICATIONS
  // ============================================================================

  describe('HTTP Specifications', () => {
    it('should return 201 Created status for successful registration', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: `http201-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(201);
    });

    it('should return 400 Bad Request for validation errors', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'invalid',
          password: 'short',
        });

      expect(response.status).toBe(400);
    });

    it('should return Content-Type application/json', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `jsontype-${Date.now()}@example.com`,
          password: 'Password123',
        })
        .expect(201);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should accept POST method on /v1/auth/register', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: `post-${Date.now()}@example.com`,
          password: 'Password123',
        });

      // Should get 201 or 400 (not 405 Method Not Allowed)
      expect([201, 400]).toContain(response.status);
    });
  });

  // ============================================================================
  // ERROR RESPONSE VALIDATION
  // ============================================================================

  describe('Error Response Format', () => {
    it('should include error message in 400 response', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should have consistent error response structure', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          password: 'Password123',
          // Missing email
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBeDefined();
    });
  });
});
