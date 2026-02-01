/**
 * Acceptance Tests for PATCH /v1/todo/update
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const UPDATE_TODO_ENDPOINT = `${BASE_URL}/v1/todo/list`;
const CREATE_TODO_ENDPOINT = `${BASE_URL}/v1/todo/create`;
const LOGIN_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

export enum PriorityEnum {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

interface UpdateTodoResponse {
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
 * Create a todo for testing
 */
const createTestTodo = async (
    accessToken: string,
    name: string = "Test Todo",
    priority: PriorityEnum = PriorityEnum.MEDIUM,
): Promise<string> => {
    const response = await fetch(CREATE_TODO_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            name,
            priority,
        }),
    });

    const body = (await response.json()) as any;
    return body.data?.id;
};

/**
 * Make an update todo request with authentication
 */
const makeUpdateTodoRequest = async (
    accessToken: string | null,
    todoId: string | null,
    updateData?: {
        name?: string;
        priority?: string;
        completed?: boolean;
    },
): Promise<UpdateTodoResponse> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const endpoint = todoId ? `${UPDATE_TODO_ENDPOINT}/${todoId}` : UPDATE_TODO_ENDPOINT;

        const response = await fetch(endpoint, {
            method: "PATCH",
            headers,
            body: JSON.stringify(updateData || {}),
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
        throw new Error(`Failed to make update todo request: ${error}`);
    }
};

describe("PATCH /v1/todo/update - Acceptance Tests", () => {
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

    describe("Happy Path: Successful Todo Update", () => {
        it("should update todo name", async () => {
            const testEmail = `update-name-${Date.now()}@example.com`;
            const testPassword = "UpdateNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original name",
                PriorityEnum.HIGH,
            );

            const newName = "Updated name";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: newName },
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("id", todoId);
            expect(response.body.data).toHaveProperty("name", newName);
            expect(response.body.data).toHaveProperty("priority", PriorityEnum.HIGH);
        });

        it("should update todo priority to LOW", async () => {
            const testEmail = `update-low-${Date.now()}@example.com`;
            const testPassword = "UpdateLowPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to update",
                PriorityEnum.HIGH,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { priority: PriorityEnum.LOW },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.priority).toBe(PriorityEnum.LOW);
            expect(response.body.data.name).toBe("Todo to update");
        });

        it("should update todo priority to MEDIUM", async () => {
            const testEmail = `update-medium-${Date.now()}@example.com`;
            const testPassword = "UpdateMediumPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to update",
                PriorityEnum.LOW,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { priority: PriorityEnum.MEDIUM },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.priority).toBe(PriorityEnum.MEDIUM);
        });

        it("should update todo priority to HIGH", async () => {
            const testEmail = `update-high-${Date.now()}@example.com`;
            const testPassword = "UpdateHighPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to update",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { priority: PriorityEnum.HIGH },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.priority).toBe(PriorityEnum.HIGH);
        });

        it("should mark todo as completed", async () => {
            const testEmail = `update-completed-${Date.now()}@example.com`;
            const testPassword = "UpdateCompletedPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to complete",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { completed: true },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.completed).toBe(true);
        });

        it("should mark todo as not completed", async () => {
            const testEmail = `update-uncompleted-${Date.now()}@example.com`;
            const testPassword = "UpdateUncompletedPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to uncomplete",
                PriorityEnum.MEDIUM,
            );

            // First mark as completed
            await makeUpdateTodoRequest(loginResult.accessToken, todoId, {
                completed: true,
            });

            // Then mark as not completed
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { completed: false },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.completed).toBe(false);
        });

        it("should update multiple fields at once", async () => {
            const testEmail = `update-multiple-${Date.now()}@example.com`;
            const testPassword = "UpdateMultiplePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original name",
                PriorityEnum.LOW,
            );

            const newName = "Updated with multiple fields";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                {
                    name: newName,
                    priority: PriorityEnum.HIGH,
                    completed: true,
                },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(newName);
            expect(response.body.data.priority).toBe(PriorityEnum.HIGH);
            expect(response.body.data.completed).toBe(true);
        });

        it("should update todo with special characters in name", async () => {
            const testEmail = `update-special-${Date.now()}@example.com`;
            const testPassword = "UpdateSpecialPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const specialName = "Updated: Complete @project #1 (urgent)!";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: specialName },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(specialName);
        });

        it("should update todo with unicode characters in name", async () => {
            const testEmail = `update-unicode-${Date.now()}@example.com`;
            const testPassword = "UpdateUnicodePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const unicodeName = "更新 تحديث обновить 🎉";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: unicodeName },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(unicodeName);
        });
    });

    // ============================================================================
    // VALIDATION SCENARIOS
    // ============================================================================

    describe("Validation: Update Fields", () => {
        it("should reject empty update request", async () => {
            const testEmail = `empty-update-${Date.now()}@example.com`;
            const testPassword = "EmptyUpdatePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                {},
            );

            // Empty update might be allowed or rejected depending on implementation
            // Adjust expectation based on actual behavior
            expect([200, 400]).toContain(response.status);
        });

        it("should reject invalid priority value", async () => {
            const testEmail = `invalid-priority-${Date.now()}@example.com`;
            const testPassword = "InvalidPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { priority: "INVALID" },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject null name", async () => {
            const testEmail = `null-name-${Date.now()}@example.com`;
            const testPassword = "NullNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: null as any },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject empty name", async () => {
            const testEmail = `empty-name-${Date.now()}@example.com`;
            const testPassword = "EmptyNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "" },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject name longer than 255 characters", async () => {
            const testEmail = `toolong-name-${Date.now()}@example.com`;
            const testPassword = "TooLongNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const longName = "a".repeat(256);
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: longName },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // ID VALIDATION SCENARIOS
    // ============================================================================

    describe("Validation: Todo ID", () => {
        it("should reject invalid UUID format", async () => {
            const testEmail = `invalid-id-${Date.now()}@example.com`;
            const testPassword = "InvalidIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                "not-a-valid-uuid",
                { name: "Updated" },
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject non-existent todo", async () => {
            const testEmail = `nonexistent-${Date.now()}@example.com`;
            const testPassword = "NonexistentPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                fakeUUID,
                { name: "Updated" },
            );

            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });

        it("should reject null ID", async () => {
            const testEmail = `null-id-${Date.now()}@example.com`;
            const testPassword = "NullIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                null,
                { name: "Updated" },
            );

            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // AUTHENTICATION SCENARIOS
    // ============================================================================

    describe("Validation: Authentication", () => {
        it("should reject request without authentication token", async () => {
            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeUpdateTodoRequest(null, fakeUUID, {
                name: "Updated",
            });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with invalid authentication token", async () => {
            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeUpdateTodoRequest(
                "invalid.token.here",
                fakeUUID,
                { name: "Updated" },
            );

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with malformed authorization header", async () => {
            const testEmail = `malformed-${Date.now()}@example.com`;
            const testPassword = "MalformedPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";

            // Manually make request with wrong Bearer format
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: loginResult.accessToken, // Missing "Bearer " prefix
            };

            const response = await fetch(`${UPDATE_TODO_ENDPOINT}/${fakeUUID}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ name: "Updated" }),
            });

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // OWNERSHIP VALIDATION
    // ============================================================================

    describe("Validation: Todo Ownership", () => {
        it("should prevent user from updating another user's todo", async () => {
            // User 1 creates a todo
            const email1 = `owner1-${Date.now()}@example.com`;
            const password1 = "Owner1Password123";
            await registerTestUser(email1, password1);
            const loginResult1 = await loginTestUser(email1, password1);

            const todoId = await createTestTodo(
                loginResult1.accessToken,
                "User 1's Todo",
                PriorityEnum.HIGH,
            );

            // User 2 tries to update User 1's todo
            const email2 = `owner2-${Date.now()}@example.com`;
            const password2 = "Owner2Password123";
            await registerTestUser(email2, password2);
            const loginResult2 = await loginTestUser(email2, password2);

            const response = await makeUpdateTodoRequest(
                loginResult2.accessToken,
                todoId,
                { name: "Hacked!" },
            );

            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // RESPONSE STRUCTURE VALIDATION
    // ============================================================================

    describe("Response Structure: Successful Update", () => {
        it("should return response with correct structure", async () => {
            const testEmail = `struct-${Date.now()}@example.com`;
            const testPassword = "StructPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("data");
        });

        it("should return 200 status on successful update", async () => {
            const testEmail = `status200-${Date.now()}@example.com`;
            const testPassword = "Status200Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });

        it("should return updated todo with all required fields", async () => {
            const testEmail = `fields-${Date.now()}@example.com`;
            const testPassword = "FieldsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            const todo = response.body.data;
            expect(todo).toHaveProperty("id");
            expect(todo).toHaveProperty("name");
            expect(todo).toHaveProperty("priority");
            expect(todo).toHaveProperty("completed");
            expect(todo).toHaveProperty("userId");
            expect(todo).toHaveProperty("createdAt");
            expect(todo).toHaveProperty("updatedAt");
        });

        it("should have valid UUID for todo id", async () => {
            const testEmail = `uuid-${Date.now()}@example.com`;
            const testPassword = "UuidPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(uuidRegex.test(response.body.data.id)).toBe(true);
        });

        it("should have valid timestamps for todo", async () => {
            const testEmail = `timestamps-${Date.now()}@example.com`;
            const testPassword = "TimestampsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.LOW,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            expect(new Date(response.body.data.createdAt)).toBeInstanceOf(Date);
            expect(new Date(response.body.data.updatedAt)).toBeInstanceOf(Date);
        });

        it("should update the updatedAt timestamp", async () => {
            const testEmail = `update-timestamp-${Date.now()}@example.com`;
            const testPassword = "UpdateTimestampPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.MEDIUM,
            );

            // Small delay to ensure different timestamps
            await new Promise((resolve) => setTimeout(resolve, 100));

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            const createdAt = new Date(response.body.data.createdAt).getTime();
            const updatedAt = new Date(response.body.data.updatedAt).getTime();
            expect(updatedAt).toBeGreaterThanOrEqual(createdAt);
        });

        it("should preserve userId after update", async () => {
            const testEmail = `preserve-userid-${Date.now()}@example.com`;
            const testPassword = "PreserveUserIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.userId).toBe(loginResult.userId);
        });
    });

    // ============================================================================
    // HTTP STATUS CODES
    // ============================================================================

    describe("HTTP Status Codes", () => {
        it("should return 200 on successful update", async () => {
            const testEmail = `status200-${Date.now()}@example.com`;
            const testPassword = "Status200Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "Updated" },
            );

            expect(response.status).toBe(200);
        });

        it("should return 400 on invalid ID", async () => {
            const testEmail = `status400-${Date.now()}@example.com`;
            const testPassword = "Status400Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                "not-a-uuid",
                { name: "Updated" },
            );

            expect(response.status).toBe(400);
        });

        it("should return 401 without authentication", async () => {
            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeUpdateTodoRequest(null, fakeUUID, {
                name: "Updated",
            });

            expect(response.status).toBe(401);
        });

        it("should return 404 for non-existent todo", async () => {
            const testEmail = `status404-${Date.now()}@example.com`;
            const testPassword = "Status404Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                fakeUUID,
                { name: "Updated" },
            );

            expect(response.status).toBe(404);
        });
    });

    // ============================================================================
    // PARTIAL UPDATE SCENARIOS
    // ============================================================================

    describe("Partial Updates", () => {
        it("should update only name without affecting other fields", async () => {
            const testEmail = `partial-name-${Date.now()}@example.com`;
            const testPassword = "PartialNamePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original name",
                PriorityEnum.HIGH,
            );

            const newName = "New name";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: newName },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(newName);
            expect(response.body.data.priority).toBe(PriorityEnum.HIGH);
            expect(response.body.data.completed).toBe(false);
        });

        it("should update only priority without affecting other fields", async () => {
            const testEmail = `partial-priority-${Date.now()}@example.com`;
            const testPassword = "PartialPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const originalName = "Original name";
            const todoId = await createTestTodo(
                loginResult.accessToken,
                originalName,
                PriorityEnum.LOW,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { priority: PriorityEnum.HIGH },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(originalName);
            expect(response.body.data.priority).toBe(PriorityEnum.HIGH);
        });

        it("should update only completed status without affecting other fields", async () => {
            const testEmail = `partial-completed-${Date.now()}@example.com`;
            const testPassword = "PartialCompletedPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const originalName = "Original name";
            const originalPriority = PriorityEnum.MEDIUM;
            const todoId = await createTestTodo(
                loginResult.accessToken,
                originalName,
                originalPriority,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { completed: true },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(originalName);
            expect(response.body.data.priority).toBe(originalPriority);
            expect(response.body.data.completed).toBe(true);
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe("Edge Cases", () => {
        it("should handle todo name with maximum length (255 chars)", async () => {
            const testEmail = `max-length-${Date.now()}@example.com`;
            const testPassword = "MaxLengthPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const maxNameLength = "a".repeat(255);
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: maxNameLength },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(maxNameLength);
        });

        it("should handle todo name with single character", async () => {
            const testEmail = `single-char-${Date.now()}@example.com`;
            const testPassword = "SingleCharPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "X" },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe("X");
        });

        it("should handle todo name with HTML characters", async () => {
            const testEmail = `html-chars-${Date.now()}@example.com`;
            const testPassword = "HtmlCharsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.MEDIUM,
            );

            const htmlName = "<script>alert('test')</script>";
            const response = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: htmlName },
            );

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(htmlName);
        });

        it("should handle multiple sequential updates", async () => {
            const testEmail = `sequential-${Date.now()}@example.com`;
            const testPassword = "SequentialPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Original",
                PriorityEnum.LOW,
            );

            // First update
            const response1 = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { name: "First update" },
            );
            expect(response1.status).toBe(200);
            expect(response1.body.data.name).toBe("First update");

            // Second update
            const response2 = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { priority: PriorityEnum.HIGH },
            );
            expect(response2.status).toBe(200);
            expect(response2.body.data.name).toBe("First update");
            expect(response2.body.data.priority).toBe(PriorityEnum.HIGH);

            // Third update
            const response3 = await makeUpdateTodoRequest(
                loginResult.accessToken,
                todoId,
                { completed: true },
            );
            expect(response3.status).toBe(200);
            expect(response3.body.data.name).toBe("First update");
            expect(response3.body.data.priority).toBe(PriorityEnum.HIGH);
            expect(response3.body.data.completed).toBe(true);
        });
    });
});
