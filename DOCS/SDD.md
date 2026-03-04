# Specification-Driven Development (SDD) Document

## The Best ToDo Task API

**Version:** 1.0.0  
**Last Updated:** 2026-03-03  
**Author:** Jose Carlos Huerta

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Specification](#2-architecture-specification)
3. [API Specification](#3-api-specification)
4. [Data Models](#4-data-models)
5. [Authentication Specification](#5-authentication-specification)
6. [Validation Rules](#6-validation-rules)
7. [Error Handling](#7-error-handling)
8. [Security Specification](#8-security-specification)
9. [Testing Specification](#9-testing-specification)
10. [Infrastructure Specification](#10-infrastructure-specification)

---

## 1. Project Overview

### 1.1 Purpose

A production-ready RESTful API for managing TODO tasks with user authentication. The API enables users to register, login, and perform CRUD operations on their personal TODO items.

### 1.2 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime environment |
| Express.js | 4.18+ | Web framework |
| TypeScript | 5.3+ | Type-safe language |
| PostgreSQL | 16+ | Relational database |
| Sequelize | 6.35+ | ORM for database |
| JWT (jsonwebtoken) | 9.0+ | Token-based authentication |
| Argon2 | 0.31+ | Password hashing |
| Zod | 3.22+ | Schema validation |
| Swagger/OpenAPI | 6.2+ | API documentation |
| Jest | 30.2+ | Testing framework |
| Docker | Latest | Containerization |

### 1.3 Project Structure

```
src/
├── index.ts                          # Application entry point
│
├── application/                      # Business logic layer
│   ├── auth/                        # Authentication feature (Vertical Slice)
│   │   ├── sign-up/
│   │   │   ├── SignUpUseCase.ts
│   │   │   └── models/SignUpDto.ts
│   │   ├── login/
│   │   ├── refresh-token/
│   │   └── get-user/
│   │
│   ├── todo/                        # Todo feature (Vertical Slice)
│   │   ├── create-todo/
│   │   ├── get-all-todos/
│   │   ├── get-todo-by-id/
│   │   ├── update-todo/
│   │   └── delete-todo-by-id/
│   │
│   └── shared/                      # Shared services
│       ├── models/                 # Domain interfaces
│       ├── infrastructure/        # JWT, Crypto, Config
│       └── sequelize/              # Database models & repos
│
└── presentation/                    # HTTP layer
    ├── controllers/                # Request handlers
    ├── routes/                     # Route definitions
    ├── middlewares/                # Auth, Validation
    └── swagger/                    # API documentation
```

---

## 2. Architecture Specification

### 2.1 Design Pattern

**Vertical Slice Architecture** combined with **Clean Architecture** principles.

### 2.2 Layer Responsibilities

| Layer | Responsibility | Components |
|-------|---------------|------------|
| Presentation | HTTP handling | Controllers, Routes, Middlewares, Swagger |
| Application | Business logic | Use Cases, DTOs, Validation, Services |
| Infrastructure | Data & External | Database, Repositories, External Services |

### 2.3 Vertical Slice Pattern

Each feature (auth, todo) is organized as an independent slice containing:
- **Models**: DTOs with Zod validation schemas
- **Application**: Use cases with business logic
- **Presentation**: Controllers and routes

This ensures:
- ✅ Low coupling between features
- ✅ High cohesion within features
- ✅ Easy to add/modify features
- ✅ Clear separation of concerns

---

## 3. API Specification

### 3.1 Base URL

```
Development: http://localhost:3001
Production:  https://api.example.com
```

### 3.2 API Versioning

All endpoints use `/v1` prefix.

### 3.3 Endpoints Summary

#### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/v1/auth/register` | POST | Register new user | ❌ No |
| `/v1/auth/login` | POST | User login, returns JWT | ❌ No |
| `/v1/auth/refresh-token` | POST | Refresh expired access token | ❌ No |
| `/v1/auth/me` | GET | Get current user profile | ✅ Yes |

#### Todo Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/v1/todo/create` | POST | Create new todo | ✅ Yes |
| `/v1/todo/list` | GET | Retrieve all todos (paginated) | ✅ Yes |
| `/v1/todo/list/:id` | GET | Retrieve single todo by ID | ✅ Yes |
| `/v1/todo/list/:id` | PATCH | Update todo by ID | ✅ Yes |
| `/v1/todo/list/:id` | DELETE | Delete todo by ID | ✅ Yes |

#### Health Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/health` | GET | Health check | ❌ No |

### 3.4 Response Format

All responses follow a consistent structure:

#### Success Response

```json
{
  "status": "success",
  "data": { ... }
}
```

#### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "errors": { ... }  // Optional: field-specific errors
}
```

### 3.5 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Successful GET/PATCH/DELETE request |
| 201 | Successful resource creation |
| 400 | Validation error (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 409 | Conflict (e.g., email already exists) |
| 500 | Server error |

### 3.6 API Documentation

Interactive API documentation available at:
```
http://localhost:3001/api-docs
```

---

## 4. Data Models

### 4.1 User Model

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique user identifier |
| name | VARCHAR(255) | Required | User's full name |
| email | VARCHAR(255) | Unique, Required | User email address |
| passwordHash | VARCHAR(255) | Required | Argon2 hashed password |
| createdAt | TIMESTAMP | Auto | Creation timestamp |
| updatedAt | TIMESTAMP | Auto | Last update timestamp |

**Indexes:**
- `idx_users_email` - For fast email lookups

### 4.2 Todo Model

| Field | Type | Constraints | Default |
|------|------|-------------|---------|
| id | UUID | Primary Key | Auto-generated UUID |
| name | VARCHAR(255) | Required, 1-255 chars | - |
| priority | ENUM | Required | `medium` |
| completed | BOOLEAN | - | `false` |
| userId | UUID | Foreign Key → users.id | - |
| createdAt | TIMESTAMP | Auto | Creation timestamp |
| updatedAt | TIMESTAMP | Auto | Last update timestamp |

**Priority Enum Values:**
- `low` - Less urgent, can be done later
- `medium` - Normal priority
- `high` - Urgent, should be done ASAP

**Indexes:**
- `idx_todos_user_id` - For user todo lookups
- `idx_todos_completed` - For filtering

**Relationships:**
- CASCADE delete: When user is deleted, all their todos are deleted

### 4.3 RefreshToken Model

| Field | Type | Constraints | Description |
|------|------|-------------|-------------|
| id | BIGSERIAL | Primary Key | Auto-increment ID |
| userId | UUID | Foreign Key → users.id | Owner of token |
| tokenHash | VARCHAR(64) | Required | SHA256 hash of token |
| parentId | BIGINT | Nullable | For token family tracking |
| isRevoked | BOOLEAN | Default: false | Revocation status |
| revokedAt | TIMESTAMP | Nullable | When token was revoked |
| replacedByTokenHash | VARCHAR(64) | Nullable | Theft tracking |
| expiresAt | TIMESTAMP | Required | Expiration time |
| createdAt | TIMESTAMP | Auto | Creation timestamp |
| createdIp | INET | Nullable | Client IP address |
| userAgent | TEXT | Nullable | Client user agent |

**Indexes:**
- `idx_refresh_tokens_hash` - Token lookup
- `idx_refresh_tokens_user` - User's tokens

---

## 5. Authentication Specification

### 5.1 Authentication Flow

```
1. User Registration (POST /v1/auth/register)
   ↓
2. Password hashed with Argon2
   ↓
3. User stored in database
   ↓
4. User Login (POST /v1/auth/login)
   ↓
5. Credentials validated
   ↓
6. Generate JWT Access Token (15 min expiry)
   ↓
7. Generate Refresh Token (7 days expiry) → HTTP-only cookie
   ↓
8. Return Access Token in response body
   ↓
9. Protected Routes (Bearer token in Authorization header)
   ↓
10. Token verified before access
```

### 5.2 Token Configuration

| Token Type | Expiry | Storage | Purpose |
|------------|--------|---------|---------|
| Access Token | 15 minutes | Response body | API authorization |
| Refresh Token | 7 days | HTTP-only cookie | Token renewal |

### 5.3 Token Security

- Access tokens are short-lived for security
- Refresh tokens stored in HTTP-only cookies (JavaScript inaccessible)
- Token family tracking detects token theft
- Automatic revocation for compromised tokens

### 5.4 Password Security

- **Algorithm**: Argon2 (memory-hard, GPU-resistant)
- **Minimum length**: 8 characters
- **Never stored**: Plaintext passwords

---

## 6. Validation Rules

### 6.1 User Registration

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| name | Required, min 3 characters | "Name is required" |
| email | Required, valid email format | "Invalid email address" |
| password | Required, min 8 characters | "Password must be at least 8 characters" |

### 6.2 User Login

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| email | Required, valid email format | "Invalid email address" |
| password | Required | "Password is required" |

### 6.3 Create Todo

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| name | Required, 1-255 characters | "Todo name is required" |
| priority | Required, must be `low`, `medium`, or `high` | "Invalid priority" |

### 6.4 Update Todo

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| name | Optional, 1-255 characters | "Name must be between 1 and 255 characters" |
| priority | Optional, must be `low`, `medium`, or `high` | "Invalid priority" |
| completed | Optional, boolean | "Completed must be a boolean" |

### 6.5 Get All Todos (Query Parameters)

| Parameter | Validation Rule | Default | Limits |
|-----------|-----------------|---------|--------|
| priority | Optional, `low`, `medium`, `high` | All priorities | - |
| page | Optional, integer >= 1 | 1 | Min: 1 |
| limit | Optional, integer 1-100 | 10 | Min: 1, Max: 100 |

---

## 7. Error Handling

### 7.1 Error Response Structure

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": {
    "fieldName": "Field-specific error message"
  }
}
```

### 7.2 Common Error Scenarios

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Invalid email format | 400 | "Invalid email address" |
| Email already exists | 409 | "User already exists" |
| Invalid credentials | 401 | "Invalid email or password" |
| Missing authentication | 401 | "No authentication token provided" |
| Invalid token | 401 | "Invalid or expired token" |
| Todo not found | 404 | "Todo not found or you don't have permission to access it" |
| Validation failed | 400 | "Validation failed" |

### 7.3 Middleware Error Handling

- **ValidationMiddleware**: Zod schema validation for request bodies and query parameters
- **AuthMiddleware**: JWT token verification and user extraction

---

## 8. Security Specification

### 8.1 API Security

- ✅ JWT Bearer token authentication
- ✅ Input validation with Zod
- ✅ SQL injection prevention via Sequelize ORM
- ✅ CORS protection with configurable allowed origins

### 8.2 Password Security

- ✅ Argon2 hashing (memory-hard algorithm)
- ✅ Minimum 8 character password requirement
- ✅ No plaintext passwords stored

### 8.3 Token Security

- ✅ JWT with secrets
- ✅ HTTP-only cookies for refresh tokens
- ✅ Token family tracking for theft detection
- ✅ Automatic expiration

### 8.4 Environment Security

- ✅ Secrets in .env files (git-ignored)
- ✅ No secrets in version control
- ✅ Docker non-root user

---

## 9. Testing Specification

### 9.1 Test Types

| Type | Location | Purpose |
|------|----------|---------|
| Acceptance Tests | `/tests/acceptance/` | Integration testing |
| Stress Tests | `/tests/stress/` | Performance testing |

### 9.2 Acceptance Tests

Located in `/tests/acceptance/`:

| Test File | Coverage |
|-----------|----------|
| `auth.register.spec.ts` | User registration |
| `auth.login.spec.ts` | User login |
| `auth.refresh-token.spec.ts` | Token refresh |
| `todo.create.spec.ts` | Create todo |
| `todo.update.spec.ts` | Update todo |
| `todo.delete-by-id.spec.ts` | Delete todo |

### 9.3 Test Commands

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test:watch

# Coverage report
npm test:coverage

# Debug mode
npm test:debug
```

### 9.4 Test Coverage Areas

- ✅ Happy Path: Normal operation scenarios
- ✅ Validation: Invalid inputs and edge cases
- ✅ Authentication: Token handling and authorization
- ✅ Response Structure: Verify response format
- ✅ HTTP Status Codes: Correct codes for all scenarios
- ✅ Edge Cases: Unicode, special characters, boundaries

---

## 10. Infrastructure Specification

### 10.1 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | API server port | `3001` |
| NODE_ENV | Environment mode | `development` |
| POSTGRES_HOST | Database host | `localhost` |
| POSTGRES_PORT | Database port | `5432` |
| POSTGRES_DB | Database name | `todo_db` |
| POSTGRES_USER | Database user | `postgres` |
| POSTGRES_PASSWORD | Database password | `your_password` |
| ACCESS_TOKEN_SECRET | Secret for access tokens | Min 32 chars |
| REFRESH_TOKEN_SECRET | Secret for refresh tokens | Min 32 chars |
| ACCESS_TOKEN_EXPIRY | Access token lifetime | `15m` (default) |
| REFRESH_TOKEN_EXPIRY | Refresh token lifetime | `7d` (default) |
| ALLOWED_ORIGINS | CORS allowed origins | Comma-separated URLs |

### 10.2 Docker Configuration

**Services:**
- PostgreSQL 16 (database)
- Node.js (application)

**Docker Features:**
- Alpine-based images (lightweight)
- Non-root user (security)
- Health checks (database readiness)
- Hot reload (development)
- Volume mounts (live development)
- Network isolation

### 10.3 Database Migrations

Located in `/database/migrations/`:
- `2025-01-30.01.table-for-user.sql` - Users table
- `2025-01-30.02.create-table-for-todo.sql` - Todos table
- `2025-01-30.02.table-for-refresh-tokens.sql` - Refresh tokens table

---

## Appendix A: API Examples

### A.1 Register User

```bash
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

### A.2 Login

```bash
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}

Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

### A.3 Create Todo

```bash
POST /v1/todo/create
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Complete project",
  "priority": "high"
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Complete project",
    "priority": "high",
    "completed": false,
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-02-01T10:30:00.000Z",
    "updatedAt": "2026-02-01T10:30:00.000Z"
  }
}
```

### A.4 Get All Todos

```bash
GET /v1/todo/list?priority=high&page=1&limit=10
Authorization: Bearer YOUR_TOKEN

Response (200):
{
  "status": "success",
  "data": {
    "todos": [...],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Appendix B: Swagger Documentation

The API includes interactive Swagger documentation at `/api-docs`.

**Swagger Features:**
- Interactive API testing
- Request/Response schema documentation
- Authentication configuration
- HTTP status code descriptions

---

## Appendix C: Production Checklist

Before deploying to production:

- [ ] Update `.env` with strong secrets (min 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set `NODE_ENV=production`
- [ ] Enable database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)

---

**End of SDD Document**
