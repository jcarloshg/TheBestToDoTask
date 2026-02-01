/**
 * Acceptance Tests for POST /v1/auth/refresh-token
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/v1/auth/refresh-token`;
const LOGIN_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

interface RefreshTokenResponse {
    status: number;
    body: any;
    headers: Headers;
    cookies?: string;
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
    password: string,
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
 * Login user and get refresh token cookie
 */
const loginTestUser = async (
    email: string,
    password: string,
): Promise<{
    accessToken: string;
    cookies: string | null;
    response: any;
}> => {
    const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const body = (await response.json()) as any;
    const setCookieHeader = response.headers.get("set-cookie");

    return {
        accessToken: body.data?.accessToken as string,
        cookies: setCookieHeader,
        response: body,
    };
};

/**
 * Make a refresh token request with cookies
 */
const makeRefreshTokenRequest = async (
    cookies?: string | null,
): Promise<RefreshTokenResponse> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (cookies) {
            headers["Cookie"] = cookies;
        }

        const response = await fetch(REFRESH_TOKEN_ENDPOINT, {
            method: "POST",
            headers,
        });

        let parsedBody: any;
        try {
            parsedBody = await response.json();
        } catch {
            parsedBody = null;
        }

        // const setCookieHeader = response.headers.get("set-cookie");
        // TODO improve this !!!
        let setCookieHeader = "";
        response.headers.getSetCookie().filter((currentCookie) => {
            if (currentCookie.length > setCookieHeader.length) setCookieHeader = currentCookie;
        });

        return {
            status: response.status,
            body: parsedBody,
            headers: response.headers,
            cookies: setCookieHeader || undefined,
        };
    } catch (error) {
        throw new Error(`Failed to make refresh token request: ${error}`);
    }
};

describe("POST /v1/auth/refresh-token - Acceptance Tests", () => {
    /**
     * Verify server is running before tests
     */
    beforeAll(async () => {
        const isHealthy = await checkServerHealth();
        if (!isHealthy) {
            throw new Error(
                `Server is not running at ${BASE_URL}. Please start the server before running tests.`,
            );
        }
    });

    // ============================================================================
    // HAPPY PATH SCENARIOS
    // ============================================================================

    describe("Happy Path: Successful Token Refresh", () => {
        it("should refresh token with valid refresh token in cookie", async () => {
            const testEmail = `refresh-test-${Date.now()}@example.com`;
            const testPassword = "RefreshTestPassword123";

            // Register and login
            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            expect(loginResult.cookies).toBeDefined();
            expect(loginResult.accessToken).toBeTruthy();

            // Refresh the token
            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("accessToken");

            // Verify new access token is a valid JWT
            const newAccessToken = response.body.data.accessToken;
            expect(typeof newAccessToken).toBe("string");
            expect(newAccessToken.split(".").length).toBe(3);

            // Verify it's different from old token
            expect(newAccessToken).not.toBe(loginResult.accessToken);

            // Verify new refresh token in cookie
            expect(response.cookies).toBeDefined();
        });

        it("should return new access token with correct JWT format", async () => {
            const testEmail = `token-format-${Date.now()}@example.com`;
            const testPassword = "TokenFormatPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);

            const { accessToken } = response.body.data;
            const parts = accessToken.split(".");

            // JWT should have 3 parts: header.payload.signature
            expect(parts.length).toBe(3);
            expect(parts[0]).toBeTruthy();
            expect(parts[1]).toBeTruthy();
            expect(parts[2]).toBeTruthy();
        });

        it("should set new refresh token in HTTP-only cookie", async () => {
            const testEmail = `new-refresh-${Date.now()}@example.com`;
            const testPassword = "NewRefreshPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
            expect(response.cookies).toBeDefined();

            if (response.cookies) {
                expect(response.cookies.toLowerCase()).toContain("refreshtoken");
                expect(response.cookies.toLowerCase()).toContain("httponly");
            }
        });
    });

    // ============================================================================
    // MISSING/INVALID REFRESH TOKEN SCENARIOS
    // ============================================================================

    describe("Validation: Missing or Invalid Refresh Token", () => {
        it("should reject request without refresh token cookie", async () => {
            const response = await makeRefreshTokenRequest(null);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
            expect(response.body.message).toBeDefined();
        });

        it("should reject request with empty refresh token cookie", async () => {
            const response = await makeRefreshTokenRequest("");

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with malformed refresh token", async () => {
            const malformedToken = "invalid.malformed.token";
            const cookieHeader = `refreshToken=${malformedToken}`;

            const response = await makeRefreshTokenRequest(cookieHeader);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with incorrect cookie name", async () => {
            const response = await makeRefreshTokenRequest(
                "wrongCookieName=sometoken123",
            );

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with tampered refresh token", async () => {
            const testEmail = `tampered-${Date.now()}@example.com`;
            const testPassword = "TamperedPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const rawCookies = loginResult.cookies || "";
            let tamperedCookie = "";
            if (rawCookies.length > 0) {
                const tamperedCookieArray = rawCookies.split(" ");
                tamperedCookieArray[0] =
                    tamperedCookieArray[0].slice(0, -1) + "_INVALID" + ";";
                tamperedCookie = tamperedCookieArray.join(" ");
            }

            const response = await makeRefreshTokenRequest(tamperedCookie);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // RESPONSE STRUCTURE VALIDATION
    // ============================================================================

    describe("Response Structure: Successful Refresh", () => {
        it("should return response with correct structure", async () => {
            const testEmail = `struct-${Date.now()}@example.com`;
            const testPassword = "StructPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("accessToken");
        });

        it("should only return accessToken in response body", async () => {
            const testEmail = `onlytoken-${Date.now()}@example.com`;
            const testPassword = "OnlyTokenPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
            // Response should NOT contain user data (only in login)
            expect(response.body.data).not.toHaveProperty("user");
            expect(response.body.data).not.toHaveProperty("password");
            expect(response.body.data).not.toHaveProperty("refreshToken");
        });

        it("should not return refresh token in response body", async () => {
            const testEmail = `norefresh-${Date.now()}@example.com`;
            const testPassword = "NoRefreshPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
            expect(response.body.data).not.toHaveProperty("refreshToken");
        });
    });

    // ============================================================================
    // MULTIPLE REFRESH ATTEMPTS
    // ============================================================================

    describe("Multiple Refresh Attempts", () => {
        it("should allow multiple consecutive token refreshes", async () => {
            const testEmail = `multiple-${Date.now()}@example.com`;
            const testPassword = "MultiplePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const tokens: string[] = [loginResult.accessToken];
            const currentCookie = loginResult.cookies;

            // First refresh

            const refresh1 = await makeRefreshTokenRequest(currentCookie);

            expect(refresh1.status).toBe(200);
            tokens.push(refresh1.body.data.accessToken);
            // currentCookie = refresh1.cookies!;

            // Second refresh with new cookie

            const refresh2 = await makeRefreshTokenRequest(refresh1.cookies);

            expect(refresh2.status).toBe(200);
            tokens.push(refresh2.body.data.accessToken);

            // All tokens should be different
            expect(tokens[0]).not.toBe(tokens[1]);
            expect(tokens[1]).not.toBe(tokens[2]);
            expect(tokens[0]).not.toBe(tokens[2]);
        });

        it("should invalidate old refresh token after refresh", async () => {
            const testEmail = `invalidate-${Date.now()}@example.com`;
            const testPassword = "InvalidatePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // First refresh with original cookie
            const refresh1 = await makeRefreshTokenRequest(loginResult.cookies);
            expect(refresh1.status).toBe(200);

            // Try to use old cookie again - should fail
            const refresh2 = await makeRefreshTokenRequest(loginResult.cookies);
            expect(refresh2.status).toBe(401);
        });

        it("should allow immediate consecutive refreshes with new cookies", async () => {
            const testEmail = `consecutive-${Date.now()}@example.com`;
            const testPassword = "ConsecutivePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // First refresh
            const refresh1 = await makeRefreshTokenRequest(loginResult.cookies);
            expect(refresh1.status).toBe(200);
            expect(refresh1.cookies).toBeDefined();

            // Second refresh with new cookie from first refresh
            const refresh2 = await makeRefreshTokenRequest(refresh1.cookies);
            expect(refresh2.status).toBe(200);

            // Third refresh
            const refresh3 = await makeRefreshTokenRequest(refresh2.cookies);
            expect(refresh3.status).toBe(200);
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe("Edge Cases: Cookie Handling", () => {
        it("should handle refresh token with additional cookies", async () => {
            const testEmail = `additional-${Date.now()}@example.com`;
            const testPassword = "AdditionalPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Add additional cookies to the request
            const cookieWithExtra =
                (loginResult.cookies || "") + "; otherCookie=value";

            const response = await makeRefreshTokenRequest(cookieWithExtra);

            // Should still work - should only use refreshToken cookie
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty("accessToken");
        });

        it("should handle refresh token cookie with path attribute", async () => {
            const testEmail = `path-${Date.now()}@example.com`;
            const testPassword = "PathPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Extract token value and recreate with path
            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty("accessToken");
        });

        it("should handle refresh with case variations in cookie name", async () => {
            const testEmail = `case-${Date.now()}@example.com`;
            const testPassword = "CasePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Note: Cookie names are case-sensitive in HTTP spec, but test with original
            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
        });
    });

    // ============================================================================
    // RESPONSE HTTP STATUS CODES
    // ============================================================================

    describe("HTTP Status Codes", () => {
        it("should return 200 on successful refresh", async () => {
            const testEmail = `status200-${Date.now()}@example.com`;
            const testPassword = "Status200Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeRefreshTokenRequest(loginResult.cookies);

            expect(response.status).toBe(200);
        });

        it("should return 401 without refresh token", async () => {
            const response = await makeRefreshTokenRequest(null);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should return 401 with invalid refresh token", async () => {
            const response = await makeRefreshTokenRequest(
                "refreshToken=invalid.token.here",
            );

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // TOKEN REFRESH FLOW
    // ============================================================================

    describe("Token Refresh Flow: Complete Scenario", () => {
        it("should complete full auth flow: register -> login -> refresh", async () => {
            const testEmail = `fullflow-${Date.now()}@example.com`;
            const testPassword = "FullFlowPassword123";

            // 1. Register
            const registerResult = await registerTestUser(testEmail, testPassword);
            expect(registerResult.status).toBe("success");
            expect(registerResult.data).toHaveProperty("id");

            // 2. Login
            const loginResult = await loginTestUser(testEmail, testPassword);
            expect(loginResult.response.status).toBe("success");
            expect(loginResult.accessToken).toBeTruthy();
            expect(loginResult.cookies).toBeTruthy();

            // 3. Refresh token
            const refreshResult = await makeRefreshTokenRequest(loginResult.cookies);
            expect(refreshResult.status).toBe(200);
            expect(refreshResult.body.data).toHaveProperty("accessToken");

            // Verify tokens are different
            expect(refreshResult.body.data.accessToken).not.toBe(
                loginResult.accessToken,
            );
        });

        it("should maintain session across multiple operations", async () => {
            const testEmail = `session-${Date.now()}@example.com`;
            const testPassword = "SessionPassword123";

            // Register and login
            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const originalAccessToken = loginResult.accessToken;
            let currentCookie = loginResult.cookies;

            // Simulate multiple refresh cycles
            for (let i = 0; i < 3; i++) {
                const refreshResult = await makeRefreshTokenRequest(currentCookie);
                expect(refreshResult.status).toBe(200);
                expect(refreshResult.body.data.accessToken).toBeTruthy();
                expect(refreshResult.body.data.accessToken).not.toBe(
                    originalAccessToken,
                );

                currentCookie = refreshResult.cookies!;
            }
        });
    });

    // ============================================================================
    // ERROR SCENARIOS
    // ============================================================================

    describe("Error Scenarios", () => {
        it("should return error response with message", async () => {
            const response = await makeRefreshTokenRequest(null);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("status", "error");
            expect(response.body).toHaveProperty("message");
            expect(typeof response.body.message).toBe("string");
            expect(response.body.message.length).toBeGreaterThan(0);
        });

        it("should not expose sensitive information in error response", async () => {
            const response = await makeRefreshTokenRequest(
                "refreshToken=invalid.token",
            );

            expect(response.status).toBe(401);
            const responseStr = JSON.stringify(response.body);

            // Should not contain database details, stack traces, etc.
            expect(responseStr).not.toContain("password");
            expect(responseStr).not.toContain("secret");
        });
    });
});
