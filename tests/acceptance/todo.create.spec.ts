/**
 * Acceptance Tests for POST /v1/todo/create
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const CREATE_TODO_ENDPOINT = `${BASE_URL}/v1/todo/create`;
const LOGIN_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

export enum PriorityEnum {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

interface CreateTodoResponse {
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
 * Login user and get access token
 */
const loginTestUser = async (
    email: string,
    password: string,
): Promise<{
    accessToken: string;
    userId: string;
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

    return {
        accessToken: body.data?.accessToken,
        userId: body.data?.user?.id,
    };
};

/**
 * Make a create todo request with authentication
 */
const makeCreateTodoRequest = async (
    accessToken: string | null,
    body: any,
): Promise<CreateTodoResponse> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(CREATE_TODO_ENDPOINT, {
            method: "POST",
            headers,
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
        throw new Error(`Failed to make create todo request: ${error}`);
    }
};

describe("POST /v1/todo/create - Acceptance Tests", () => {
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

    describe("Happy Path: Successful Todo Creation", () => {
        it("should create a todo with valid name and priority", async () => {
            const testEmail = `todo-test-${Date.now()}@example.com`;
            const testPassword = "TodoTestPassword123";

            // Register and login
            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoName = "Complete project documentation";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: todoName,
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("name", todoName);
            expect(response.body.data).toHaveProperty("priority", PriorityEnum.HIGH);
            expect(response.body.data).toHaveProperty("completed", false);
            expect(response.body.data).toHaveProperty("userId", loginResult.userId);
            expect(response.body.data).toHaveProperty("createdAt");
            expect(response.body.data).toHaveProperty("updatedAt");

            // Verify ID is valid UUID
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(uuidRegex.test(response.body.data.id)).toBe(true);

            // Verify timestamps are valid ISO 8601
            expect(new Date(response.body.data.createdAt)).toBeInstanceOf(Date);
            expect(new Date(response.body.data.updatedAt)).toBeInstanceOf(Date);
        });

        it("should create todo with LOW priority", async () => {
            const testEmail = `low-priority-${Date.now()}@example.com`;
            const testPassword = "LowPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Low priority task",
                    priority: PriorityEnum.LOW,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.priority).toBe(PriorityEnum.LOW);
        });

        it("should create todo with MEDIUM priority", async () => {
            const testEmail = `medium-priority-${Date.now()}@example.com`;
            const testPassword = "MediumPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Medium priority task",
                    priority: PriorityEnum.MEDIUM,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.priority).toBe(PriorityEnum.MEDIUM);
        });

        it("should create todo with single character name", async () => {
            const testEmail = `single-char-${Date.now()}@example.com`;
            const testPassword = "SingleCharPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "A",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.name).toBe("A");
        });

        it("should create todo with maximum length name (255 chars)", async () => {
            const testEmail = `max-length-${Date.now()}@example.com`;
            const testPassword = "MaxLengthPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const maxNameLength = "a".repeat(255);
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: maxNameLength,
                    priority: PriorityEnum.MEDIUM,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.name).toBe(maxNameLength);
        });
    });

    // ============================================================================
    // NAME VALIDATION SCENARIOS
    // ============================================================================

    describe("Validation: Todo Name", () => {
        it("should reject empty todo name", async () => {
            const testEmail = `empty-name-${Date.now()}@example.com`;
            const testPassword = "EmptyNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject todo name longer than 255 characters", async () => {
            const testEmail = `toolong-${Date.now()}@example.com`;
            const testPassword = "TooLongPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const tooLongName = "a".repeat(256);
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: tooLongName,
                    priority: PriorityEnum.LOW,
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject null todo name", async () => {
            const testEmail = `null-name-${Date.now()}@example.com`;
            const testPassword = "NullNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: null,
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should accept todo name with special characters", async () => {
            const testEmail = `special-chars-${Date.now()}@example.com`;
            const testPassword = "SpecialCharsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const specialName = "Todo: Complete @project #1 (urgent) [2025]!";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: specialName,
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.name).toBe(specialName);
        });

        it("should accept todo name with unicode characters", async () => {
            const testEmail = `unicode-${Date.now()}@example.com`;
            const testPassword = "UnicodePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const unicodeName = "完成项目 مشروع тест 🚀";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: unicodeName,
                    priority: PriorityEnum.MEDIUM,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.name).toBe(unicodeName);
        });

        it("should accept todo name with leading and trailing spaces", async () => {
            const testEmail = `spaces-${Date.now()}@example.com`;
            const testPassword = "SpacesPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const nameWithSpaces = "  Todo with spaces  ";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: nameWithSpaces,
                    priority: PriorityEnum.LOW,
                },
            );

            expect(response.status).toBe(201);
        });
    });

    // ============================================================================
    // PRIORITY VALIDATION SCENARIOS
    // ============================================================================

    describe("Validation: Priority", () => {
        it("should reject invalid priority value", async () => {
            const testEmail = `invalid-priority-${Date.now()}@example.com`;
            const testPassword = "InvalidPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: "URGENT",
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject null priority", async () => {
            const testEmail = `null-priority-${Date.now()}@example.com`;
            const testPassword = "NullPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: null,
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject mixed case priority", async () => {
            const testEmail = `mixed-case-${Date.now()}@example.com`;
            const testPassword = "MixedCasePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: "High",
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // MISSING FIELD SCENARIOS
    // ============================================================================

    describe("Validation: Missing Required Fields", () => {
        it("should reject request without name field", async () => {
            const testEmail = `no-name-${Date.now()}@example.com`;
            const testPassword = "NoNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject request without priority field", async () => {
            const testEmail = `no-priority-${Date.now()}@example.com`;
            const testPassword = "NoPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject empty request body", async () => {
            const testEmail = `empty-body-${Date.now()}@example.com`;
            const testPassword = "EmptyBodyPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(loginResult.accessToken, {});

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // AUTHENTICATION SCENARIOS
    // ============================================================================

    describe("Validation: Authentication", () => {
        it("should reject request without authentication token", async () => {
            const response = await makeCreateTodoRequest(null, {
                name: "Test todo",
                priority: PriorityEnum.HIGH,
            });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with invalid authentication token", async () => {
            const response = await makeCreateTodoRequest(
                "invalid.token.here",
                {
                    name: "Test todo",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with malformed authorization header", async () => {
            const testEmail = `malformed-${Date.now()}@example.com`;
            const testPassword = "MalformedPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Manually make request with wrong Bearer format
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: loginResult.accessToken, // Missing "Bearer " prefix
            };

            const response = await fetch(CREATE_TODO_ENDPOINT, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    name: "Test todo",
                    priority: PriorityEnum.HIGH,
                }),
            });

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // RESPONSE STRUCTURE VALIDATION
    // ============================================================================

    describe("Response Structure: Successful Creation", () => {
        it("should return response with correct structure", async () => {
            const testEmail = `struct-${Date.now()}@example.com`;
            const testPassword = "StructPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("name");
            expect(response.body.data).toHaveProperty("priority");
            expect(response.body.data).toHaveProperty("completed");
            expect(response.body.data).toHaveProperty("userId");
            expect(response.body.data).toHaveProperty("createdAt");
            expect(response.body.data).toHaveProperty("updatedAt");
        });

        it("should set completed to false by default", async () => {
            const testEmail = `default-false-${Date.now()}@example.com`;
            const testPassword = "DefaultFalsePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: PriorityEnum.MEDIUM,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.completed).toBe(false);
        });

        it("should have matching userId from authenticated user", async () => {
            const testEmail = `userid-${Date.now()}@example.com`;
            const testPassword = "UserIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: PriorityEnum.LOW,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.userId).toBe(loginResult.userId);
        });

        it("should have createdAt and updatedAt as same time initially", async () => {
            const testEmail = `timestamps-${Date.now()}@example.com`;
            const testPassword = "TimestampsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.createdAt).toBe(
                response.body.data.updatedAt,
            );
        });
    });

    // ============================================================================
    // MULTIPLE TODOS CREATION
    // ============================================================================

    describe("Multiple Todos Creation", () => {
        it("should allow creating multiple todos for same user", async () => {
            const testEmail = `multiple-${Date.now()}@example.com`;
            const testPassword = "MultiplePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoIds: string[] = [];

            // Create first todo
            const response1 = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "First todo",
                    priority: PriorityEnum.HIGH,
                },
            );
            expect(response1.status).toBe(201);
            todoIds.push(response1.body.data.id);

            // Create second todo
            const response2 = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Second todo",
                    priority: PriorityEnum.MEDIUM,
                },
            );
            expect(response2.status).toBe(201);
            todoIds.push(response2.body.data.id);

            // Create third todo
            const response3 = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Third todo",
                    priority: PriorityEnum.LOW,
                },
            );
            expect(response3.status).toBe(201);
            todoIds.push(response3.body.data.id);

            // All IDs should be different
            expect(new Set(todoIds).size).toBe(3);
        });

        it("should create todos with same name for different users", async () => {
            const sharedTodoName = "Shared todo name";
            const sameName = sharedTodoName;

            // First user
            const email1 = `user1-${Date.now()}@example.com`;
            const password1 = "User1Password123";
            await registerTestUser(email1, password1);
            const loginResult1 = await loginTestUser(email1, password1);

            // Second user
            const email2 = `user2-${Date.now()}@example.com`;
            const password2 = "User2Password123";
            await registerTestUser(email2, password2);
            const loginResult2 = await loginTestUser(email2, password2);

            // Create todo for first user
            const response1 = await makeCreateTodoRequest(
                loginResult1.accessToken,
                {
                    name: sameName,
                    priority: PriorityEnum.HIGH,
                },
            );
            expect(response1.status).toBe(201);

            // Create todo for second user
            const response2 = await makeCreateTodoRequest(
                loginResult2.accessToken,
                {
                    name: sameName,
                    priority: PriorityEnum.HIGH,
                },
            );
            expect(response2.status).toBe(201);

            // IDs should be different even though names are same
            expect(response1.body.data.id).not.toBe(response2.body.data.id);
            expect(response1.body.data.userId).not.toBe(
                response2.body.data.userId,
            );
        });
    });

    // ============================================================================
    // HTTP STATUS CODES
    // ============================================================================

    describe("HTTP Status Codes", () => {
        it("should return 201 on successful creation", async () => {
            const testEmail = `status201-${Date.now()}@example.com`;
            const testPassword = "Status201Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "Test todo",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
        });

        it("should return 400 on validation error", async () => {
            const testEmail = `status400-${Date.now()}@example.com`;
            const testPassword = "Status400Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: "",
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(400);
        });

        it("should return 401 without authentication", async () => {
            const response = await makeCreateTodoRequest(null, {
                name: "Test todo",
                priority: PriorityEnum.HIGH,
            });

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe("Edge Cases", () => {
        it("should handle todo name with newlines", async () => {
            const testEmail = `newlines-${Date.now()}@example.com`;
            const testPassword = "NewlinesPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const nameWithNewlines = "Line 1\nLine 2\nLine 3";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: nameWithNewlines,
                    priority: PriorityEnum.MEDIUM,
                },
            );

            expect(response.status).toBe(201);
        });

        it("should handle todo name with tabs", async () => {
            const testEmail = `tabs-${Date.now()}@example.com`;
            const testPassword = "TabsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const nameWithTabs = "Item\t1\tItem\t2";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: nameWithTabs,
                    priority: PriorityEnum.LOW,
                },
            );

            expect(response.status).toBe(201);
        });

        it("should handle todo name with HTML characters", async () => {
            const testEmail = `html-${Date.now()}@example.com`;
            const testPassword = "HtmlPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const htmlName = "<script>alert('xss')</script>";
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: htmlName,
                    priority: PriorityEnum.HIGH,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.name).toBe(htmlName);
        });

        it("should handle todo name with JSON", async () => {
            const testEmail = `json-${Date.now()}@example.com`;
            const testPassword = "JsonPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const jsonName = '{"key": "value", "number": 123}';
            const response = await makeCreateTodoRequest(
                loginResult.accessToken,
                {
                    name: jsonName,
                    priority: PriorityEnum.MEDIUM,
                },
            );

            expect(response.status).toBe(201);
            expect(response.body.data.name).toBe(jsonName);
        });
    });
});
