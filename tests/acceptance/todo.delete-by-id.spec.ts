/**
 * Acceptance Tests for DELETE /v1/todo/list
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const DELETE_TODO_ENDPOINT = `${BASE_URL}/v1/todo/list`;
const CREATE_TODO_ENDPOINT = `${BASE_URL}/v1/todo/create`;
const LOGIN_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

export enum PriorityEnum {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

interface DeleteTodoResponse {
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
 * Make a delete todo request with authentication
 */
const makeDeleteTodoRequest = async (
    accessToken: string | null,
    todoId: string | null,
): Promise<DeleteTodoResponse> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const endpoint = todoId ? `${DELETE_TODO_ENDPOINT}/${todoId}` : DELETE_TODO_ENDPOINT;

        console.log(`endpoint: `, endpoint);

        const response = await fetch(endpoint, {
            method: "DELETE",
            headers,
        });

        let parsedBody: any;
        try {
            parsedBody = await response.json();
            console.log(`parsedBody: `, parsedBody);
        } catch {
            parsedBody = null;
        }

        return {
            status: response.status,
            body: parsedBody,
            headers: response.headers,
        };
    } catch (error) {
        throw new Error(`Failed to make delete todo request: ${error}`);
    }
};

describe("DELETE /v1/todo/delete-by-id - Acceptance Tests", () => {
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

    describe("Happy Path: Successful Todo Deletion", () => {
        it("should delete an existing todo successfully", async () => {
            const testEmail = `delete-test-${Date.now()}@example.com`;
            const testPassword = "DeleteTestPassword123";

            // Register and login
            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create a todo
            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to be deleted",
                PriorityEnum.HIGH,
            );

            console.log(`todoId: `, todoId);

            // Delete the todo
            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("data");
        });

        it("should delete todo with LOW priority", async () => {
            const testEmail = `delete-low-priority-${Date.now()}@example.com`;
            const testPassword = "DeleteLowPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Low priority todo",
                PriorityEnum.LOW,
            );

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });

        it("should delete todo with MEDIUM priority", async () => {
            const testEmail = `delete-medium-priority-${Date.now()}@example.com`;
            const testPassword = "DeleteMediumPriorityPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Medium priority todo",
                PriorityEnum.MEDIUM,
            );

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });

        it("should delete todo with special characters in name", async () => {
            const testEmail = `delete-special-${Date.now()}@example.com`;
            const testPassword = "DeleteSpecialPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const specialName = "Todo: Complete @project #1 (urgent)!";
            const todoId = await createTestTodo(
                loginResult.accessToken,
                specialName,
                PriorityEnum.HIGH,
            );

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });

        it("should allow deleting multiple todos", async () => {
            const testEmail = `delete-multiple-${Date.now()}@example.com`;
            const testPassword = "DeleteMultiplePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create three todos
            const todoId1 = await createTestTodo(
                loginResult.accessToken,
                "First todo",
                PriorityEnum.HIGH,
            );
            const todoId2 = await createTestTodo(
                loginResult.accessToken,
                "Second todo",
                PriorityEnum.MEDIUM,
            );
            const todoId3 = await createTestTodo(
                loginResult.accessToken,
                "Third todo",
                PriorityEnum.LOW,
            );

            // Delete all three
            const response1 = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId1,
            );
            expect(response1.status).toBe(200);

            const response2 = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId2,
            );
            expect(response2.status).toBe(200);

            const response3 = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId3,
            );
            expect(response3.status).toBe(200);
        });
    });

    // ============================================================================
    // ID VALIDATION SCENARIOS
    // ============================================================================

    describe("Validation: Todo ID", () => {
        it("should reject deletion with invalid UUID format", async () => {
            const testEmail = `invalid-id-${Date.now()}@example.com`;
            const testPassword = "InvalidIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                "not-a-valid-uuid",
            );

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject deletion with empty ID", async () => {
            const testEmail = `empty-id-${Date.now()}@example.com`;
            const testPassword = "EmptyIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                "",
            );

            // the path/resource is not exist
            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });

        it("should reject deletion with null ID", async () => {
            const testEmail = `null-id-${Date.now()}@example.com`;
            const testPassword = "NullIdPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                null,
            );

            // the path/resource is not exist
            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });

        it("should reject deletion of non-existent todo", async () => {
            const testEmail = `nonexistent-${Date.now()}@example.com`;
            const testPassword = "NonexistentPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                fakeUUID,
            );

            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // MISSING FIELD SCENARIOS
    // ============================================================================

    describe("Validation: Missing Required Fields", () => {
        it("should reject request without id in URL", async () => {
            const testEmail = `no-id-field-${Date.now()}@example.com`;
            const testPassword = "NoIdFieldPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await fetch(DELETE_TODO_ENDPOINT, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loginResult.accessToken}`,
                },
            });

            // the path/resource is not exist
            expect(response.status).toBe(404);
        });
    });

    // ============================================================================
    // AUTHENTICATION SCENARIOS
    // ============================================================================

    describe("Validation: Authentication", () => {
        it("should reject request without authentication token", async () => {
            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeDeleteTodoRequest(null, fakeUUID);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with invalid authentication token", async () => {
            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeDeleteTodoRequest(
                "invalid.token.here",
                fakeUUID,
            );

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with malformed authorization header", async () => {
            const testEmail = `malformed-delete-${Date.now()}@example.com`;
            const testPassword = "MalformedDeletePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";

            // Manually make request with wrong Bearer format
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: loginResult.accessToken, // Missing "Bearer " prefix
            };

            const response = await fetch(`${DELETE_TODO_ENDPOINT}/${fakeUUID}`, {
                method: "DELETE",
                headers,
            });

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // OWNERSHIP VALIDATION
    // ============================================================================

    describe("Validation: Todo Ownership", () => {
        it("should prevent user from deleting another user's todo", async () => {
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

            // User 2 tries to delete User 1's todo
            const email2 = `owner2-${Date.now()}@example.com`;
            const password2 = "Owner2Password123";
            await registerTestUser(email2, password2);
            const loginResult2 = await loginTestUser(email2, password2);

            const response = await makeDeleteTodoRequest(
                loginResult2.accessToken,
                todoId,
            );

            expect(response.status).toBe(404);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // RESPONSE STRUCTURE VALIDATION
    // ============================================================================

    describe("Response Structure: Successful Deletion", () => {
        it("should return response with correct structure", async () => {
            const testEmail = `struct-delete-${Date.now()}@example.com`;
            const testPassword = "StructDeletePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("data");
        });

        it("should return 200 status on successful deletion", async () => {
            const testEmail = `status200-${Date.now()}@example.com`;
            const testPassword = "Status200Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Test todo",
                PriorityEnum.HIGH,
            );

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );

            expect(response.status).toBe(200);
        });
    });

    // ============================================================================
    // HTTP STATUS CODES
    // ============================================================================

    describe("HTTP Status Codes", () => {
        it("should return 400 on invalid ID", async () => {
            const testEmail = `status400-delete-${Date.now()}@example.com`;
            const testPassword = "Status400DeletePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                "not-a-uuid",
            );

            expect(response.status).toBe(400);
        });

        it("should return 401 without authentication", async () => {
            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeDeleteTodoRequest(null, fakeUUID);

            expect(response.status).toBe(401);
        });

        it("should return 404 for non-existent todo", async () => {
            const testEmail = `status404-${Date.now()}@example.com`;
            const testPassword = "Status404Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const fakeUUID = "550e8400-e29b-41d4-a716-446655440000";
            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                fakeUUID,
            );

            expect(response.status).toBe(404);
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe("Edge Cases", () => {
        it("should reject deletion attempt with uppercase UUID", async () => {
            const testEmail = `uppercase-${Date.now()}@example.com`;
            const testPassword = "UppercasePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const uppercaseUUID = "550E8400-E29B-41D4-A716-446655440000".toUpperCase();
            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                uppercaseUUID,
            );

            // the path/resource is not exist
            expect(response.status).toBe(404);
        });

        it("should handle deletion request with extra whitespace in ID", async () => {
            const testEmail = `whitespace-${Date.now()}@example.com`;
            const testPassword = "WhitespacePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeDeleteTodoRequest(
                loginResult.accessToken,
                "  550e8400-e29b-41d4-a716-446655440000  ",
            );

            expect(response.status).toBe(400);
        });

        it("should handle deletion of already deleted todo", async () => {
            const testEmail = `double-delete-${Date.now()}@example.com`;
            const testPassword = "DoubleDeletePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoId = await createTestTodo(
                loginResult.accessToken,
                "Todo to delete twice",
                PriorityEnum.HIGH,
            );

            // First deletion should succeed
            const response1 = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );
            expect(response1.status).toBe(200);

            // Second deletion should fail
            const response2 = await makeDeleteTodoRequest(
                loginResult.accessToken,
                todoId,
            );
            expect(response2.status).toBe(404);
        });
    });
});
