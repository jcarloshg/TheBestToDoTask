/**
 * Acceptance Tests for GET /v1/todo/list
 *
 * These tests send actual HTTP requests to the live server
 * running at http://localhost:3001 and validate the complete request/response cycle.
 */

const BASE_URL = "http://localhost:3001";
const GET_TODOS_ENDPOINT = `${BASE_URL}/v1/todo/list`;
const CREATE_TODO_ENDPOINT = `${BASE_URL}/v1/todo/create`;
const LOGIN_ENDPOINT = `${BASE_URL}/v1/auth/login`;
const REGISTER_ENDPOINT = `${BASE_URL}/v1/auth/register`;
const HEALTH_ENDPOINT = `${BASE_URL}/health`;

export enum PriorityEnum {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

interface GetTodosResponse {
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
 * Make a get all todos request with authentication and query parameters
 */
const makeGetTodosRequest = async (
    accessToken: string | null,
    queryParams?: {
        priority?: string;
        page?: number;
        limit?: number;
    },
): Promise<GetTodosResponse> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        let url = GET_TODOS_ENDPOINT;

        // Build query string if params provided
        if (queryParams) {
            const params = new URLSearchParams();
            if (queryParams.priority) {
                params.append("priority", queryParams.priority);
            }
            if (queryParams.page !== undefined) {
                params.append("page", queryParams.page.toString());
            }
            if (queryParams.limit !== undefined) {
                params.append("limit", queryParams.limit.toString());
            }
            const queryString = params.toString();
            if (queryString) {
                url = `${GET_TODOS_ENDPOINT}?${queryString}`;
            }
        }

        const response = await fetch(url, {
            method: "GET",
            headers,
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
        throw new Error(`Failed to make get todos request: ${error}`);
    }
};

describe("GET /v1/todo/list - Acceptance Tests", () => {
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

    describe("Happy Path: Retrieve Todos Successfully", () => {
        it("should retrieve empty list for user with no todos", async () => {
            const testEmail = `get-empty-${Date.now()}@example.com`;
            const testPassword = "GetEmptyPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("data");
            expect(Array.isArray(response.body.data.todos)).toBe(true);
            expect(response.body.data.todos.length).toBe(0);
            expect(response.body.data).toHaveProperty("total", 0);
            expect(response.body.data).toHaveProperty("page", 1);
            expect(response.body.data).toHaveProperty("limit");
            expect(response.body.data).toHaveProperty("totalPages", 0);
        });

        it("should retrieve single todo for user", async () => {
            const testEmail = `get-single-${Date.now()}@example.com`;
            const testPassword = "GetSinglePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const todoName = "Single todo";
            await createTestTodo(
                loginResult.accessToken,
                todoName,
                PriorityEnum.HIGH,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(Array.isArray(response.body.data.todos)).toBe(true);
            expect(response.body.data.todos.length).toBe(1);
            expect(response.body.data.todos[0]).toHaveProperty("id");
            expect(response.body.data.todos[0]).toHaveProperty("name", todoName);
            expect(response.body.data.todos[0]).toHaveProperty("priority", PriorityEnum.HIGH);
        });

        it("should retrieve multiple todos for user", async () => {
            const testEmail = `get-multiple-${Date.now()}@example.com`;
            const testPassword = "GetMultiplePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create three todos
            await createTestTodo(
                loginResult.accessToken,
                "First todo",
                PriorityEnum.HIGH,
            );
            await createTestTodo(
                loginResult.accessToken,
                "Second todo",
                PriorityEnum.MEDIUM,
            );
            await createTestTodo(
                loginResult.accessToken,
                "Third todo",
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
            expect(Array.isArray(response.body.data.todos)).toBe(true);
            expect(response.body.data.todos.length).toBe(3);
        });

        it("should retrieve todos with correct structure", async () => {
            const testEmail = `get-structure-${Date.now()}@example.com`;
            const testPassword = "GetStructurePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Structured todo",
                PriorityEnum.MEDIUM,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(1);

            const todo = response.body.data.todos[0];
            expect(todo).toHaveProperty("id");
            expect(todo).toHaveProperty("name");
            expect(todo).toHaveProperty("priority");
            expect(todo).toHaveProperty("completed");
            expect(todo).toHaveProperty("userId", loginResult.userId);
            expect(todo).toHaveProperty("createdAt");
            expect(todo).toHaveProperty("updatedAt");
        });

        it("should retrieve todos with all priorities", async () => {
            const testEmail = `get-priorities-${Date.now()}@example.com`;
            const testPassword = "GetPrioritiesPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Low priority",
                PriorityEnum.LOW,
            );
            await createTestTodo(
                loginResult.accessToken,
                "Medium priority",
                PriorityEnum.MEDIUM,
            );
            await createTestTodo(
                loginResult.accessToken,
                "High priority",
                PriorityEnum.HIGH,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            console.log(`response: `, response);

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(3);

            const priorities = response.body.data.todos.map((todo: any) => todo.priority);
            expect(priorities).toContain(PriorityEnum.LOW);
            expect(priorities).toContain(PriorityEnum.MEDIUM);
            expect(priorities).toContain(PriorityEnum.HIGH);
        });

        it("should only retrieve todos for authenticated user", async () => {
            // User 1 creates todos
            const email1 = `user1-get-${Date.now()}@example.com`;
            const password1 = "User1GetPassword123";
            await registerTestUser(email1, password1);
            const loginResult1 = await loginTestUser(email1, password1);

            await createTestTodo(
                loginResult1.accessToken,
                "User 1 Todo",
                PriorityEnum.HIGH,
            );

            // User 2 creates different todos
            const email2 = `user2-get-${Date.now()}@example.com`;
            const password2 = "User2GetPassword123";
            await registerTestUser(email2, password2);
            const loginResult2 = await loginTestUser(email2, password2);

            await createTestTodo(
                loginResult2.accessToken,
                "User 2 Todo 1",
                PriorityEnum.MEDIUM,
            );
            await createTestTodo(
                loginResult2.accessToken,
                "User 2 Todo 2",
                PriorityEnum.LOW,
            );

            // User 1 retrieves todos - should only see their own
            const response1 = await makeGetTodosRequest(loginResult1.accessToken);
            expect(response1.status).toBe(200);
            expect(response1.body.data.todos.length).toBe(1);
            expect(response1.body.data.todos[0].name).toBe("User 1 Todo");

            // User 2 retrieves todos - should only see their own
            const response2 = await makeGetTodosRequest(loginResult2.accessToken);
            expect(response2.status).toBe(200);
            expect(response2.body.data.todos.length).toBe(2);
            const user2Names = response2.body.data.todos.map((t: any) => t.name);
            expect(user2Names).toContain("User 2 Todo 1");
            expect(user2Names).toContain("User 2 Todo 2");
        });
    });

    // ============================================================================
    // AUTHENTICATION SCENARIOS
    // ============================================================================

    describe("Validation: Authentication", () => {
        it("should reject request without authentication token", async () => {
            const response = await makeGetTodosRequest(null);

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with invalid authentication token", async () => {
            const response = await makeGetTodosRequest("invalid.token.here");

            expect(response.status).toBe(401);
            expect(response.body.status).toBe("error");
        });

        it("should reject request with malformed authorization header", async () => {
            const testEmail = `malformed-get-${Date.now()}@example.com`;
            const testPassword = "MalformedGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Manually make request with wrong Bearer format
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: loginResult.accessToken, // Missing "Bearer " prefix
            };

            const response = await fetch(GET_TODOS_ENDPOINT, {
                method: "GET",
                headers,
            });

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // RESPONSE STRUCTURE VALIDATION
    // ============================================================================

    describe("Response Structure: Successful Retrieval", () => {
        it("should return response with correct structure", async () => {
            const testEmail = `struct-get-${Date.now()}@example.com`;
            const testPassword = "StructGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("todos");
            expect(Array.isArray(response.body.data.todos)).toBe(true);
        });

        it("should return 200 status on successful retrieval", async () => {
            const testEmail = `status200-get-${Date.now()}@example.com`;
            const testPassword = "Status200GetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("success");
        });

        it("should return array of todos with all required fields", async () => {
            const testEmail = `fields-get-${Date.now()}@example.com`;
            const testPassword = "FieldsGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Todo with fields",
                PriorityEnum.HIGH,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBeGreaterThan(0);

            response.body.data.todos.forEach((todo: any) => {
                expect(todo).toHaveProperty("id");
                expect(todo).toHaveProperty("name");
                expect(todo).toHaveProperty("priority");
                expect(todo).toHaveProperty("completed");
                expect(todo).toHaveProperty("userId");
                expect(todo).toHaveProperty("createdAt");
                expect(todo).toHaveProperty("updatedAt");
            });
        });

        it("should have valid UUID for todo id", async () => {
            const testEmail = `uuid-get-${Date.now()}@example.com`;
            const testPassword = "UuidGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "UUID todo",
                PriorityEnum.MEDIUM,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            response.body.data.todos.forEach((todo: any) => {
                expect(uuidRegex.test(todo.id)).toBe(true);
            });
        });

        it("should have valid timestamps for todos", async () => {
            const testEmail = `timestamps-get-${Date.now()}@example.com`;
            const testPassword = "TimestampsGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Timestamped todo",
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            response.body.data.todos.forEach((todo: any) => {
                expect(new Date(todo.createdAt)).toBeInstanceOf(Date);
                expect(new Date(todo.updatedAt)).toBeInstanceOf(Date);
            });
        });
    });

    // ============================================================================
    // HTTP STATUS CODES
    // ============================================================================

    describe("HTTP Status Codes", () => {
        it("should return 200 for authenticated user", async () => {
            const testEmail = `status200-${Date.now()}@example.com`;
            const testPassword = "Status200Password123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
        });

        it("should return 401 without authentication", async () => {
            const response = await makeGetTodosRequest(null);

            expect(response.status).toBe(401);
        });

        it("should return 401 with invalid token", async () => {
            const response = await makeGetTodosRequest("invalid.token");

            expect(response.status).toBe(401);
        });
    });

    // ============================================================================
    // COMPLETED TODOS VALIDATION
    // ============================================================================

    describe("Completed Todos Handling", () => {
        it("should mark todos as completed false by default", async () => {
            const testEmail = `completed-default-${Date.now()}@example.com`;
            const testPassword = "CompletedDefaultPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Incomplete todo",
                PriorityEnum.HIGH,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            response.body.data.todos.forEach((todo: any) => {
                expect(todo.completed).toBe(false);
            });
        });

        it("should retrieve todos with correct completed status", async () => {
            const testEmail = `completed-status-${Date.now()}@example.com`;
            const testPassword = "CompletedStatusPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Todo 1",
                PriorityEnum.MEDIUM,
            );
            await createTestTodo(
                loginResult.accessToken,
                "Todo 2",
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(2);
            response.body.data.todos.forEach((todo: any) => {
                expect(typeof todo.completed).toBe("boolean");
            });
        });
    });

    // ============================================================================
    // QUERY PARAMETERS VALIDATION
    // ============================================================================

    describe("Query Parameters: Priority Filter", () => {
        it("should filter todos by LOW priority", async () => {
            const testEmail = `filter-low-${Date.now()}@example.com`;
            const testPassword = "FilterLowPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create todos with different priorities
            await createTestTodo(
                loginResult.accessToken,
                "Low priority task",
                PriorityEnum.LOW,
            );
            await createTestTodo(
                loginResult.accessToken,
                "High priority task",
                PriorityEnum.HIGH,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: PriorityEnum.LOW,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(1);
            expect(response.body.data.todos[0].priority).toBe(PriorityEnum.LOW);
        });

        it("should filter todos by MEDIUM priority", async () => {
            const testEmail = `filter-medium-${Date.now()}@example.com`;
            const testPassword = "FilterMediumPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Medium priority task",
                PriorityEnum.MEDIUM,
            );
            await createTestTodo(
                loginResult.accessToken,
                "Low priority task",
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: PriorityEnum.MEDIUM,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(1);
            expect(response.body.data.todos[0].priority).toBe(PriorityEnum.MEDIUM);
        });

        it("should filter todos by HIGH priority", async () => {
            const testEmail = `filter-high-${Date.now()}@example.com`;
            const testPassword = "FilterHighPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "High priority task",
                PriorityEnum.HIGH,
            );
            await createTestTodo(
                loginResult.accessToken,
                "Medium priority task",
                PriorityEnum.MEDIUM,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: PriorityEnum.HIGH,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(1);
            expect(response.body.data.todos[0].priority).toBe(PriorityEnum.HIGH);
        });

        it("should return empty list when filtering by priority with no matches", async () => {
            const testEmail = `filter-no-match-${Date.now()}@example.com`;
            const testPassword = "FilterNoMatchPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Low priority task",
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: PriorityEnum.HIGH,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(0);
        });

        it("should reject invalid priority filter value", async () => {
            const testEmail = `filter-invalid-${Date.now()}@example.com`;
            const testPassword = "FilterInvalidPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: "INVALID",
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });
    });

    describe("Query Parameters: Pagination", () => {
        it("should support limit parameter", async () => {
            const testEmail = `limit-${Date.now()}@example.com`;
            const testPassword = "LimitPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create 5 todos
            for (let i = 1; i <= 5; i++) {
                await createTestTodo(
                    loginResult.accessToken,
                    `Todo ${i}`,
                    PriorityEnum.MEDIUM,
                );
            }

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                limit: 2,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(2);
        });

        it("should support page parameter", async () => {
            const testEmail = `page-${Date.now()}@example.com`;
            const testPassword = "PagePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create 6 todos
            for (let i = 1; i <= 6; i++) {
                await createTestTodo(
                    loginResult.accessToken,
                    `Todo ${i}`,
                    PriorityEnum.MEDIUM,
                );
            }

            // First page with limit 2
            const responsePage1 = await makeGetTodosRequest(loginResult.accessToken, {
                page: 1,
                limit: 2,
            });

            expect(responsePage1.status).toBe(200);
            expect(responsePage1.body.data.todos.length).toBe(2);

            // Second page with limit 2
            const responsePage2 = await makeGetTodosRequest(loginResult.accessToken, {
                page: 2,
                limit: 2,
            });

            expect(responsePage2.status).toBe(200);
            expect(responsePage2.body.data.todos.length).toBe(2);

            // Verify different pages have different todos
            const page1Ids = responsePage1.body.data.todos.map((t: any) => t.id);
            const page2Ids = responsePage2.body.data.todos.map((t: any) => t.id);
            expect(page1Ids).not.toEqual(page2Ids);
        });

        it("should support combined priority and limit parameters", async () => {
            const testEmail = `combined-filter-${Date.now()}@example.com`;
            const testPassword = "CombinedFilterPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create multiple todos with different priorities
            for (let i = 1; i <= 4; i++) {
                await createTestTodo(
                    loginResult.accessToken,
                    `High priority ${i}`,
                    PriorityEnum.HIGH,
                );
            }
            await createTestTodo(
                loginResult.accessToken,
                "Low priority",
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: PriorityEnum.HIGH,
                limit: 2,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(2);
            response.body.data.todos.forEach((todo: any) => {
                expect(todo.priority).toBe(PriorityEnum.HIGH);
            });
        });

        it("should support all three parameters together", async () => {
            const testEmail = `all-params-${Date.now()}@example.com`;
            const testPassword = "AllParamsPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create multiple todos
            for (let i = 1; i <= 10; i++) {
                await createTestTodo(
                    loginResult.accessToken,
                    `Todo ${i}`,
                    i % 2 === 0 ? PriorityEnum.HIGH : PriorityEnum.MEDIUM,
                );
            }

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                priority: PriorityEnum.HIGH,
                page: 1,
                limit: 2,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBeLessThanOrEqual(2);
            response.body.data.todos.forEach((todo: any) => {
                expect(todo.priority).toBe(PriorityEnum.HIGH);
            });
        });

        it("should return empty list for out of range page", async () => {
            const testEmail = `out-of-range-${Date.now()}@example.com`;
            const testPassword = "OutOfRangePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            await createTestTodo(
                loginResult.accessToken,
                "Todo 1",
                PriorityEnum.MEDIUM,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                page: 99,
                limit: 10,
            });

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(0);
        });

        it("should reject invalid page parameter", async () => {
            const testEmail = `invalid-page-${Date.now()}@example.com`;
            const testPassword = "InvalidPagePassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                page: -1,
                limit: 10,
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });

        it("should reject invalid limit parameter", async () => {
            const testEmail = `invalid-limit-${Date.now()}@example.com`;
            const testPassword = "InvalidLimitPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const response = await makeGetTodosRequest(loginResult.accessToken, {
                limit: 0,
            });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe("error");
        });
    });

    // ============================================================================
    // EDGE CASES
    // ============================================================================

    describe("Edge Cases", () => {
        it("should handle special characters in todo names", async () => {
            const testEmail = `special-chars-get-${Date.now()}@example.com`;
            const testPassword = "SpecialCharsGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const specialName = "Todo: Complete @project #1 (urgent)!";
            await createTestTodo(
                loginResult.accessToken,
                specialName,
                PriorityEnum.HIGH,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos[0].name).toBe(specialName);
        });

        it("should handle unicode characters in todo names", async () => {
            const testEmail = `unicode-get-${Date.now()}@example.com`;
            const testPassword = "UnicodeGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const unicodeName = "完成项目 مشروع тест 🚀";
            await createTestTodo(
                loginResult.accessToken,
                unicodeName,
                PriorityEnum.MEDIUM,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos[0].name).toBe(unicodeName);
        });

        it("should handle todo names with newlines and tabs", async () => {
            const testEmail = `newlines-get-${Date.now()}@example.com`;
            const testPassword = "NewlinesGetPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            const nameWithWhitespace = "Line 1\nLine 2\tTabbed";
            await createTestTodo(
                loginResult.accessToken,
                nameWithWhitespace,
                PriorityEnum.LOW,
            );

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos[0].name).toBe(nameWithWhitespace);
        });

        it("should handle large number of todos", async () => {
            const testEmail = `many-todos-${Date.now()}@example.com`;
            const testPassword = "ManyTodosPassword123";

            await registerTestUser(testEmail, testPassword);
            const loginResult = await loginTestUser(testEmail, testPassword);

            // Create 10 todos
            for (let i = 1; i <= 10; i++) {
                await createTestTodo(
                    loginResult.accessToken,
                    `Todo ${i}`,
                    i % 3 === 0
                        ? PriorityEnum.HIGH
                        : i % 3 === 1
                            ? PriorityEnum.MEDIUM
                            : PriorityEnum.LOW,
                );
            }

            const response = await makeGetTodosRequest(loginResult.accessToken);

            expect(response.status).toBe(200);
            expect(response.body.data.todos.length).toBe(10);
            expect(Array.isArray(response.body.data.todos)).toBe(true);
        });
    });
});
