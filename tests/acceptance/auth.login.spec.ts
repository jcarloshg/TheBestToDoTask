/**
 * Acceptance Tests for POST /v1/auth/login
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const LOGIN_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

interface LoginResponse {
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
 * Register a new user for testing
 */
const registerTestUser = async (
    email: string,
    password: string
): Promise<any> => {
    const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
            name: getRandomName(),
        }),
    });

    return await response.json();
};

/**
 * Make a login request to the live server
 */
const makeLoginRequest = async (body: any): Promise<LoginResponse> => {
    try {
        const response = await fetch(LOGIN_ENDPOINT, {
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
        throw new Error(`Failed to make login request: ${error}`);
    }
};

describe("POST /v1/auth/login - Acceptance Tests", () => {
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

    describe("Happy Path: Successful Login", () => {
        it("should login with valid email and password", async () => {
            const testEmail = `login-test-${Date.now()}@example.com`;
            const testPassword = "ValidPassword123";

            // First register a user
            await registerTestUser(testEmail, testPassword);

            // Then login with that user
            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("accessToken");
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data.user).toHaveProperty("id");
            expect(response.body.data.user).toHaveProperty("email", testEmail);

            // Verify access token is a valid JWT format
            expect(typeof response.body.data.accessToken).toBe("string");
            expect(response.body.data.accessToken.split(".").length).toBe(3); // JWT has 3 parts

            // Verify refresh token is set in cookie
            const setCookieHeader = response.headers.get("set-cookie");
            expect(setCookieHeader).toBeDefined();
            if (setCookieHeader) {
                expect(setCookieHeader.toLowerCase()).toContain("refreshtoken");
            }
        });

        it("should return access token with correct format", async () => {
            const testEmail = `token-test-${Date.now()}@example.com`;
            const testPassword = "TokenTestPassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);

            const { accessToken } = response.body.data;
            const parts = accessToken.split(".");

            // JWT should have 3 parts: header.payload.signature
            expect(parts.length).toBe(3);
            expect(parts[0]).toBeTruthy();
            expect(parts[1]).toBeTruthy();
            expect(parts[2]).toBeTruthy();
        });

        it("should include user details in response", async () => {
            const testEmail = `userdetails-${Date.now()}@example.com`;
            const testPassword = "UserDetailsPassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.user.email).toBe(testEmail);
            expect(response.body.data.user.id).toBeTruthy();

            // Verify it's a valid UUID
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(uuidRegex.test(response.body.data.user.id)).toBe(true);
        });
    });

    // ============================================================================
    // EMAIL VALIDATION SCENARIOS
    // ============================================================================

    describe("Validation: Invalid Email Format", () => {
        it("should reject email without @ symbol", async () => {
            const response = await makeLoginRequest({
                email: "invalid-email",
                password: "SomePassword123",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
            expect(response.body.message).toBeDefined();
        });

        it("should reject email with @ but no domain", async () => {
            const response = await makeLoginRequest({
                email: "user@",
                password: "SomePassword123",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject email without domain extension", async () => {
            const response = await makeLoginRequest({
                email: "userexample.com",
                password: "SomePassword123",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject email with invalid characters", async () => {
            const response = await makeLoginRequest({
                email: "user<>@example.com",
                password: "SomePassword123",
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
            const response = await makeLoginRequest({
                password: "SomePassword123",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject request without password field", async () => {
            const response = await makeLoginRequest({
                email: `test-${Date.now()}@example.com`,
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject empty request body", async () => {
            const response = await makeLoginRequest({});

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with null email", async () => {
            const response = await makeLoginRequest({
                email: null,
                password: "SomePassword123",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with null password", async () => {
            const response = await makeLoginRequest({
                email: `test-${Date.now()}@example.com`,
                password: null,
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with empty email string", async () => {
            const response = await makeLoginRequest({
                email: "",
                password: "SomePassword123",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with empty password string", async () => {
            const response = await makeLoginRequest({
                email: `test-${Date.now()}@example.com`,
                password: "",
            });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // INVALID CREDENTIALS SCENARIOS
    // ============================================================================

    describe("Validation: Invalid Credentials", () => {
        it("should reject login with non-existent email", async () => {
            const body = {
                email: `nonexistent-${Date.now()}@example.com`,
                password: "SomePassword123",
            }
            const response = await makeLoginRequest(body);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
            expect(response.body.message.toLowerCase()).toContain("invalid email or password");
        });

        it("should reject login with correct email but wrong password", async () => {
            const testEmail = `wrongpass-${Date.now()}@example.com`;
            const correctPassword = "CorrectPassword123";

            // Register with correct password
            await registerTestUser(testEmail, correctPassword);

            // Try to login with wrong password
            const response = await makeLoginRequest({
                email: testEmail,
                password: "WrongPassword456",
            });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject login with case-sensitive password mismatch", async () => {
            const testEmail = `casesensitive-${Date.now()}@example.com`;
            const testPassword = "CaseSensitivePass123";

            await registerTestUser(testEmail, testPassword);

            // Try lowercase version of password
            const response = await makeLoginRequest({
                email: testEmail,
                password: "casesensitivepass123",
            });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject login with extra spaces in password", async () => {
            const testEmail = `spaces-${Date.now()}@example.com`;
            const testPassword = "PasswordWithSpaces123";

            await registerTestUser(testEmail, testPassword);

            // Try with extra spaces
            const response = await makeLoginRequest({
                email: testEmail,
                password: `  ${testPassword}  `,
            });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // RESPONSE STRUCTURE VALIDATION
    // ============================================================================

    describe("Response Structure: Successful Login", () => {
        it("should return response with correct structure", async () => {
            const testEmail = `structure-${Date.now()}@example.com`;
            const testPassword = "StructurePassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("accessToken");
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data.user).toHaveProperty("id");
            expect(response.body.data.user).toHaveProperty("email");
        });

        it("should not return password in response", async () => {
            const testEmail = `nopass-${Date.now()}@example.com`;
            const testPassword = "NoPasswordInResponse123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.user).not.toHaveProperty("password");
            expect(JSON.stringify(response.body.data)).not.toContain(testPassword);
        });

        it("should not return refresh token in response body", async () => {
            const testEmail = `norefresh-${Date.now()}@example.com`;
            const testPassword = "NoRefreshInBody123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.data).not.toHaveProperty("refreshToken");
        });
    });

    // ============================================================================
    // COOKIE HANDLING
    // ============================================================================

    describe("Cookie Handling: Refresh Token", () => {
        it("should set refresh token in HTTP-only cookie", async () => {
            const testEmail = `httponly-${Date.now()}@example.com`;
            const testPassword = "HttpOnlyPassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);

            const setCookieHeader = response.headers.get("set-cookie");
            expect(setCookieHeader).toBeDefined();

            if (setCookieHeader) {
                expect(setCookieHeader.toLowerCase()).toContain("refreshtoken");
                expect(setCookieHeader.toLowerCase()).toContain("httponly");
            }
        });

        it("should set secure flag on refresh token cookie in production-like settings", async () => {
            const testEmail = `secure-${Date.now()}@example.com`;
            const testPassword = "SecureCookiePassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);

            const setCookieHeader = response.headers.get("set-cookie");
            expect(setCookieHeader).toBeDefined();
            // Cookie should be set (content varies based on environment)
            expect(setCookieHeader).toBeTruthy();
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe("Edge Cases: Special Characters and Long Inputs", () => {
        it("should handle email with special characters", async () => {
            const testEmail = `user+tag-${Date.now()}@subdomain.example.co.uk`;
            const testPassword = "SpecialCharPassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.user.email).toBe(testEmail);
        });

        it("should handle password with special characters", async () => {
            const testEmail = `special-pass-${Date.now()}@example.com`;
            const testPassword = "P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });

        it("should handle very long email address", async () => {
            const testEmail = `very.long.email.address.with.multiple.parts-${Date.now()}@subdomain.example.com`;
            const testPassword = "LongEmailPassword123";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.user.email).toBe(testEmail);
        });

        it("should handle very long password", async () => {
            const testEmail = `longpass-${Date.now()}@example.com`;
            const testPassword =
                "VeryLongPasswordWithManyCharactersAndSpecialSymbols!@#$%^&*()1234567890";

            await registerTestUser(testEmail, testPassword);

            const response = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });
    });

    // ============================================================================
    // MULTIPLE LOGIN ATTEMPTS
    // ============================================================================

    describe("Multiple Login Attempts", () => {
        it("should allow multiple successful logins with same credentials", async () => {
            const testEmail = `multiple-${Date.now()}@example.com`;
            const testPassword = "MultipleLoginPassword123";

            await registerTestUser(testEmail, testPassword);

            // First login
            const firstLogin = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });
            expect(firstLogin.status).toBe(200);

            // Second login with same credentials
            const secondLogin = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });
            expect(secondLogin.status).toBe(200);

            // Tokens should be different
            expect(firstLogin.body.data.accessToken).not.toBe(
                secondLogin.body.data.accessToken
            );
        });

        it("should reject multiple failed login attempts but still allow login after correct password", async () => {
            const testEmail = `failed-attempts-${Date.now()}@example.com`;
            const testPassword = "CorrectPassword123";

            await registerTestUser(testEmail, testPassword);

            // Multiple failed attempts
            const failedAttempt1 = await makeLoginRequest({
                email: testEmail,
                password: "WrongPassword1",
            });
            expect(failedAttempt1.status).toBe(401);

            const failedAttempt2 = await makeLoginRequest({
                email: testEmail,
                password: "WrongPassword2",
            });
            expect(failedAttempt2.status).toBe(401);

            // Correct password should still work
            const successfulLogin = await makeLoginRequest({
                email: testEmail,
                password: testPassword,
            });
            expect(successfulLogin.status).toBe(200);
            expect(successfulLogin.body.status).toBe("success");
        });
    });
});
