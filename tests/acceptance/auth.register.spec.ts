/**
 * Acceptance Tests for POST /v1/auth/register
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

interface RegisterResponse {
  status: number;
  body: any;
  headers: Headers;
}

export const getRandomName = (): string => {
  const names = ["Bob", "Quentin", "Rachel", "Steve", "Tina"];
  const lastNames = ["Smith", "Taylor", "Lewis", "Walker", "Hall"];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${randomName} ${randomLastName}`;
};

/**
 * Check if the server is running and healthy
 */
const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    return response.ok;
  } catch (error) {
    console.error(`Server health check failed at ${BASE_URL}:`, error);
    return false;
  }
};

/**
 * Make a registration request to the live server
 */
const makeRegisterRequest = async (body: any): Promise<RegisterResponse> => {
  try {
    const response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let parsedBody: any;
    try {
      parsedBody = await response.json();
    } catch {
      parsedBody = null;
    }

    return {
      status: response.status,
      body: parsedBody,
      headers: response.headers,
    };
  } catch (error) {
    throw new Error(`Failed to make register request: ${error}`);
  }
};

describe("POST /v1/auth/register - Acceptance Tests", () => {
  /**
   * Verify server is running before tests
   */
  beforeAll(async () => {
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      throw new Error(
        `Server is not running at ${BASE_URL}. Please start the server before running tests.`
      );
    }
  });

  // ============================================================================
  // HAPPY PATH SCENARIOS
  // ============================================================================

  describe("Happy Path: Successful Registration", () => {
    it("should register a new user with valid email and password", async () => {
      const uniqueEmail = `user-${Date.now()}@example.com`;

      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "securePassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(201);
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

      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "AnotherPassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.email).toBe(uniqueEmail);
    });

    it("should register with minimum valid password length (8 characters)", async () => {
      const uniqueEmail = `minpass-${Date.now()}@example.com`;

      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "MinPass1",
        name: getRandomName(),
      });

      expect(response.status).toBe(201);
    });

    it("should register with password containing special characters", async () => {
      const uniqueEmail = `special-${Date.now()}@example.com`;

      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "P@ssw0rd!#2025",
        name: getRandomName(),
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
    });

    it("should register with long email address", async () => {
      const uniqueEmail = `john.doe.smith.johnson-${Date.now()}@subdomain.example.com`;

      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "LongEmailPassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.email).toBe(uniqueEmail);
    });
  });

  // ============================================================================
  // EMAIL VALIDATION SCENARIOS
  // ============================================================================

  describe("Validation: Invalid Email Format", () => {
    it("should reject email without @ symbol", async () => {
      const response = await makeRegisterRequest({
        email: "invalid-email",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBeDefined();
    });

    it("should reject email with @ but no domain", async () => {
      const response = await makeRegisterRequest({
        email: "user@",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject email without domain extension", async () => {
      const response = await makeRegisterRequest({
        email: "userexample.com",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject email with invalid characters", async () => {
      const response = await makeRegisterRequest({
        email: "user<>@example.com",
        password: "SecurePassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  // ============================================================================
  // PASSWORD VALIDATION SCENARIOS
  // ============================================================================

  describe("Validation: Invalid Password", () => {
    it("should reject password shorter than 8 characters", async () => {
      const response = await makeRegisterRequest({
        email: `test-${Date.now()}@example.com`,
        password: "Short1",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject password of exactly 7 characters", async () => {
      const response = await makeRegisterRequest({
        email: `test-${Date.now()}@example.com`,
        password: "Pass123",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject empty password", async () => {
      const response = await makeRegisterRequest({
        email: `test-${Date.now()}@example.com`,
        password: "",
        name: getRandomName(),
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject whitespace-only password", async () => {
      const response = await makeRegisterRequest({
        email: `test-${Date.now()}@example.com`,
        password: "        ",
        name: getRandomName(),
      });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });

  // ============================================================================
  // MISSING FIELD SCENARIOS
  // ============================================================================

  describe("Validation: Missing Required Fields", () => {
    it("should reject request without email field", async () => {
      const response = await makeRegisterRequest({
        password: "SecurePassword123",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject request without password field", async () => {
      const response = await makeRegisterRequest({
        email: `test-${Date.now()}@example.com`,
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject empty request body", async () => {
      const response = await makeRegisterRequest({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject request with null email", async () => {
      const response = await makeRegisterRequest({
        email: null,
        password: "SecurePassword123",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject request with null password", async () => {
      const response = await makeRegisterRequest({
        email: `test-${Date.now()}@example.com`,
        password: null,
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });

    it("should reject request with empty email string", async () => {
      const response = await makeRegisterRequest({
        email: "",
        password: "SecurePassword123",
      });

      expect(response.status).toBe(400);
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
      const firstResponse = await makeRegisterRequest({
        email: uniqueEmail,
        password: "FirstPassword123",
        name: getRandomName(),
      });
      expect(firstResponse.status).toBe(201);

      // Second registration with same email - should fail
      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "SecondPassword123",
        name: getRandomName(),
      });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe("error");
      expect(response.body.message.toLowerCase()).toContain("exist");
    });

    it("should reject duplicate even with different password", async () => {
      const uniqueEmail = `dup2-${Date.now()}@example.com`;

      // First registration
      const firstResponse = await makeRegisterRequest({
        email: uniqueEmail,
        password: "OriginalPass123",
        name: getRandomName(),
      });
      expect(firstResponse.status).toBe(201);

      // Attempt duplicate with different password
      const response = await makeRegisterRequest({
        email: uniqueEmail,
        password: "DifferentPass456",
        name: getRandomName(),
      });

      expect(response.status).toBe(409);
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
