# 📝 The Best To Do Task - ToDo API

## 📋 Overview

- **The Best To Do Task** is a production-ready ToDo API built with Node.js, Express, and PostgreSQL.
- It provides secure user authentication using JWT tokens and complete Todo management with CRUD operations.
- The API implements Vertical Slice Architecture for maintainability and follows clean architecture principles with comprehensive API documentation via Swagger/OpenAPI.
- Perfect for practice production-grade backend development or as a foundation for task management applications.

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Quickstart](#-quickstart)
   - 2.1 [Prerequisites](#prerequisites)
   - 2.2 [Installation](#installation)
     - 2.2.1 [Windows](#windows)
     - 2.2.2 [Linux / macOS](#linux--macos)
   - 2.3 [Using Docker](#using-docker)
     - 2.3.1 [Automated Setup Script](#option-1-automated-setup-script-recommended)
     - 2.3.2 [Manual Docker Setup](#option-2-manual-docker-setup)
3. [Tech Stack](#-tech-stack)
4. [Database](#-database)
   - 4.1 [Database Type](#database-type)
   - 4.2 [Database Models](#database-models)
     - 4.2.1 [Users Table](#1-users-table)
     - 4.2.2 [Todos Table](#2-todos-table)
     - 4.2.3 [Refresh Tokens Table](#3-refresh-tokens-table)
   - 4.3 [Database Features](#database-features)
5. [Authentication](#-authentication)
   - 5.1 [Authentication Flow](#authentication-flow)
   - 5.2 [Authentication Endpoints](#authentication-endpoints)
   - 5.3 [Request/Response Examples](#requestresponse-examples)
     - 5.3.1 [Register](#register)
     - 5.3.2 [Login](#login)
     - 5.3.3 [Using Access Token](#using-access-token)
   - 5.4 [Token Security](#token-security)
6. [Environment Variables](#️-environment-variables)
   - 6.1 [Configuration Variables](#configuration-variables)
   - 6.2 [Environment Files](#environment-files)
   - 6.3 [Docker Environment](#docker-environment)
7. [API Documentation](#-api-documentation-swagger)
   - 7.1 [Swagger Highlights](#swagger-highlights)
     - 7.1.1 [HTTP Status Codes](#http-status-codes)
     - 7.1.2 [Input Validation](#input-validation)
     - 7.1.3 [Security Features](#security-features)
   - 7.2 [Example API Calls](#example-api-calls)
     - 7.2.1 [Create Todo](#create-todo)
     - 7.2.2 [Get All Todos](#get-all-todos-with-filtering)
     - 7.2.3 [Update Todo](#update-todo)
8. [Todo Management](#-todo-management)
   - 8.1 [Todo Endpoints](#todo-endpoints)
   - 8.2 [Todo Operations](#todo-operations)
     - 8.2.1 [Create Todo](#1-create-todo)
     - 8.2.2 [Get All Todos](#2-get-all-todos)
     - 8.2.3 [Update Todo](#3-update-todo)
     - 8.2.4 [Delete Todo](#4-delete-todo)
   - 8.3 [Todo Data Structure](#todo-data-structure)
   - 8.4 [Priority Levels](#priority-levels)
   - 8.5 [Error Responses](#error-responses)
   - 8.6 [Todo Features](#todo-management-features)
9. [Docker](#-docker)
   - 9.1 [Using Docker Compose](#using-docker-compose)
     - 9.1.1 [Quick Start](#quick-start)
     - 9.1.2 [Services](#services)
     - 9.1.3 [Docker Features](#docker-features)
10. [Architecture](#-architecture)
   - 10.1 [Architecture Layers](#architecture-layers)
   - 10.2 [Project Structure](#project-structure)
   - 10.3 [Layer Responsibilities](#layer-responsibilities)
     - 10.3.1 [Presentation Layer](#presentation-layer-srcpresentation)
     - 10.3.2 [Application Layer](#application-layer-srcapplication)
     - 10.3.3 [Infrastructure Layer](#infrastructure-layer-srcapplicationshared)
   - 10.4 [Benefits of Architecture](#benefits-of-this-architecture)
11. [Available Scripts](#-available-scripts)
12. [Testing](#-testing)
   - 12.1 [Acceptance Tests](#acceptance-tests)
   - 12.2 [Test Coverage](#test-coverage)
   - 12.3 [Running Tests](#running-tests)
13. [Performance & Optimization](#-performance--optimization)
   - 13.1 [Database Optimizations](#database-optimizations)
   - 13.2 [API Optimizations](#api-optimizations)
   - 13.3 [Response Compression](#response-compression)
14. [Security Best Practices](#-security-best-practices)
15. [Checklist for Production](#-checklist-for-production)
16. [Troubleshooting](#-troubleshooting)
   - 16.1 [Database Connection Issues](#database-connection-issues)
   - 16.2 [Port Already in Use](#port-already-in-use)
   - 16.3 [Swagger UI Not Loading](#swagger-ui-not-loading)
   - 16.4 [Tests Failing](#tests-failing)
17. [License](#-license)

---

## 🚀 Quickstart

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Latest version
- **Docker & Docker Compose**: (Optional, for containerized setup)
- **PostgreSQL**: v16 or higher (if running locally without Docker)

### Installation

> .
>
> COPY THE `.env` FILE TO THE PROJECT ROOT
>
> .

[instalation](https://github.com/user-attachments/assets/0de2dddd-9974-407d-8a42-fb4e95885baf)

#### Windows

```bash
# Clone the repository
git clone <repository-url>
cd TheBestToDoTask

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Update .env with your PostgreSQL credentials
# Then run migrations and start
npm run build
npm start
```

#### Linux / macOS

```bash
# Clone the repository
git clone <repository-url>
cd TheBestToDoTask

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your PostgreSQL credentials
# Then run migrations and start
npm run build
npm start
```

### Using Docker

#### Option 1: Automated Setup Script (Recommended)

The project includes a `set-up.sh` script that automates Docker setup:

```bash
# Make script executable
chmod +x set-up.sh

# Run setup (builds and starts Docker containers)
./set-up.sh

# The script will:
# ✓ Check Docker installation
# ✓ Validate .env.docker configuration
# ✓ Clean up previous containers/volumes
# ✓ Build and start all services
# ✓ Run database migrations automatically
```

#### Option 2: Manual Docker Setup

If you prefer manual control or the script doesn't work on your system:

```bash
# Drop existing containers & volumes (clean slate)
sudo docker compose -f docker-compose.dev.yml down -v

# Build images from Dockerfiles
sudo docker compose -f docker-compose.dev.yml build

# Run using .env.docker configuration file
sudo docker compose --env-file .env -f docker-compose.dev.yml up
```

## 🛠 Tech Stack

| Technology             | Version | Purpose                    |
| ---------------------- | ------- | -------------------------- |
| **Node.js**            | 20+     | Runtime environment        |
| **Express.js**         | 4.18+   | Web framework              |
| **TypeScript**         | 5.3+    | Type-safe language         |
| **PostgreSQL**         | 16+     | Relational database        |
| **Sequelize**          | 6.35+   | ORM for database           |
| **JWT** (jsonwebtoken) | 9.0+    | Token-based authentication |
| **Argon2**             | 0.31+   | Password hashing           |
| **Zod**                | 3.22+   | Schema validation          |
| **Swagger/OpenAPI**    | 6.2+    | API documentation          |
| **Jest**               | 30.2+   | Testing framework          |
| **Docker**             | Latest  | Containerization           |

---

## 🗄 Database

### Database Type

This project uses **PostgreSQL** (v16+) as the relational database, managed through **Sequelize ORM**.

[Video about DB](https://github.com/user-attachments/assets/b1d76169-83fc-48e3-9862-0e6c94814356)

### Database Models

#### 1. **Users Table**

Stores user account information with authentication details.

```
columns:
  - id (UUID, Primary Key)
  - name (VARCHAR 255)
  - email (VARCHAR 255, Unique)
  - password (VARCHAR 255, hashed with Argon2)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

indexes:
  - idx_users_email (for fast lookups)
```

#### 2. **Todos Table**

Stores todo items associated with users.

```
columns:
  - id (UUID, Primary Key)
  - name (VARCHAR 255)
  - priority (ENUM: low, medium, high)
  - completed (BOOLEAN, default: false)
  - user_id (UUID, Foreign Key → users.id)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

indexes:
  - idx_todos_user_id (for user lookups)
  - idx_todos_completed (for filtering)
  - Cascade delete on user deletion
```

#### 3. **Refresh Tokens Table**

Manages JWT refresh tokens with theft detection.

```
columns:
  - id (BIGSERIAL, Primary Key)
  - user_id (UUID, Foreign Key → users.id)
  - token_hash (VARCHAR 64, SHA256)
  - parent_id (BIGINT, for token family tracking)
  - is_revoked (BOOLEAN, default: false)
  - revoked_at (TIMESTAMP)
  - replaced_by_token_hash (VARCHAR 64, theft tracking)
  - expires_at (TIMESTAMP)
  - created_at (TIMESTAMP)
  - created_ip (INET, security audit)
  - user_agent (TEXT, session tracking)

indexes:
  - idx_refresh_tokens_hash
  - idx_refresh_tokens_user
```

### Database Features

- **UUID Primary Keys**: Better security than sequential IDs
- **Cascade Deletes**: Automatically remove todos when user is deleted
- **Migration-based Setup**: All schema changes tracked in Git
- **Connection Pooling**: Efficient resource management via Sequelize
- **Indexes**: Optimized queries on frequently accessed columns

---

## 🔐 Authentication

The API implements **JWT (JSON Web Token)** based authentication with secure password hashing using **Argon2**.

[auth-video](https://github.com/user-attachments/assets/e5f1d0df-739c-4a89-9382-ca257159628c)

### Authentication Flow

```
1. User Registration (POST /v1/auth/register)
   ↓
2. User provides email + password
   ↓
3. Password hashed with Argon2
   ↓
4. User stored in database
   ↓
5. User Login (POST /v1/auth/login)
   ↓
6. Email + password validated
   ↓
7. Generate JWT Access Token (15 min expiry)
   ↓
8. Generate Refresh Token (7 days expiry) → HTTP-only cookie
   ↓
9. Return Access Token in response
   ↓
10. Protected Routes (Bearer token in Authorization header)
    ↓
11. Token verified before access
```

### Authentication Endpoints

| Endpoint                 | Method | Description                  | Auth Required       |
| ------------------------ | ------ | ---------------------------- | ------------------- |
| `/v1/auth/register`      | POST   | Register new user            | ❌ No               |
| `/v1/auth/login`         | POST   | User login, returns JWT      | ❌ No               |
| `/v1/auth/refresh-token` | POST   | Refresh expired access token | ❌ No (uses cookie) |
| `/v1/auth/me`            | GET    | Get current user profile     | ✅ Yes              |

### Request/Response Examples

#### Register

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

#### Login

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

#### Using Access Token

```bash
GET /v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-01T10:30:00.000Z",
    "updatedAt": "2026-02-01T10:30:00.000Z"
  }
}
```

### Token Security

- **Access Tokens**: Short-lived (15 minutes), used for API requests
- **Refresh Tokens**: Long-lived (7 days), stored in HTTP-only cookies
- **Password Hashing**: Argon2 algorithm (memory-hard, resistant to attacks)
- **Token Family Tracking**: Detects token theft by tracking token ancestry
- **Automatic Revocation**: Compromised tokens can be invalidated

---

## ⚙️ Environment Variables

Create a `.env` file in the project root. Use `.env.example` as a template:

```bash
cp .env.example .env
```

### Configuration Variables

| Variable               | Description                     | Example                                       | Required             |
| ---------------------- | ------------------------------- | --------------------------------------------- | -------------------- |
| **Server**             |
| `PORT`                 | API server port                 | `3001`                                        | ✅ Yes               |
| `NODE_ENV`             | Environment mode                | `development`                                 | ✅ Yes               |
| **Database**           |
| `POSTGRES_HOST`        | Database host                   | `localhost` or `postgres`                     | ✅ Yes               |
| `POSTGRES_PORT`        | Database port                   | `5432`                                        | ✅ Yes               |
| `POSTGRES_DB`          | Database name                   | `todo_db`                                     | ✅ Yes               |
| `POSTGRES_USER`        | Database user                   | `postgres`                                    | ✅ Yes               |
| `POSTGRES_PASSWORD`    | Database password               | `your_password`                               | ✅ Yes               |
| **JWT Tokens**         |
| `ACCESS_TOKEN_SECRET`  | Secret for access tokens        | `your_secret_key_min_32_chars`                | ✅ Yes               |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens       | `your_secret_key_min_32_chars`                | ✅ Yes               |
| `ACCESS_TOKEN_EXPIRY`  | Access token lifetime           | `15m`                                         | ❌ No (default: 15m) |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime          | `7d`                                          | ❌ No (default: 7d)  |
| **CORS**               |
| `ALLOWED_ORIGINS`      | Comma-separated allowed origins | `http://localhost:3000,http://localhost:5173` | ❌ No                |

### Environment Files

- **`.env.example`** - Template with all required variables
- **`.env.docker`** - Docker-specific configuration (host: postgres)
- **`.env.dev`** - Development environment settings
- **`.env`** - Local configuration (git-ignored)

### Docker Environment

When using Docker Compose, use `.env.docker`:

```env
PORT=3001
NODE_ENV=development
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=todo_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
ACCESS_TOKEN_SECRET=your_secret_key_min_32_chars
REFRESH_TOKEN_SECRET=your_secret_key_min_32_chars
```

Note: `POSTGRES_HOST=postgres` (the service name in docker-compose)

---

## 📖 API Documentation (Swagger)

Once the API is running, access the interactive API documentation:

```
http://localhost:3001/api-docs
```

### Swagger Highlights

#### HTTP Status Codes

- **200**: Successful GET/PATCH/DELETE request
- **201**: Successful resource creation
- **400**: Validation error (invalid input)
- **401**: Unauthorized (missing/invalid token)
- **404**: Resource not found
- **409**: Conflict (e.g., email already exists)
- **500**: Server error

#### Input Validation

All endpoints use **Zod** schema validation:

- **Email**: Must be valid format
- **Password**: Minimum 8 characters
- **Todo Name**: 1-255 characters
- **Priority**: Must be `low`, `medium`, or `high`
- **Pagination**: Page ≥ 1, limit 1-100

#### Security Features

- **JWT Authentication**: Bearer token in Authorization header
- **Password Hashing**: Argon2 algorithm
- **HTTP-only Cookies**: Refresh tokens cannot be accessed via JavaScript
- **CORS**: Configurable allowed origins
- **Token Expiration**: Automatic token refresh with refresh tokens
- **Token Theft Detection**: Token family tracking and revocation

### Example API Calls

#### Create Todo

```bash
curl -X POST http://localhost:3001/v1/todo/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete project",
    "priority": "high"
  }'
```

#### Get All Todos with Filtering

```bash
curl http://localhost:3001/v1/todo/list?priority=high&page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Todo

```bash
curl -X PATCH http://localhost:3001/v1/todo/list/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated task",
    "completed": true,
    "priority": "medium"
  }'
```

---

## 📝 Todo Management

The API provides complete CRUD (Create, Read, Update, Delete) operations for managing todos with comprehensive features.

### Todo Endpoints

| Endpoint             | Method | Description        | Auth Required |
| -------------------- | ------ | ------------------ | ------------- |
| `/v1/todo/create`    | POST   | Create new todo    | ✅ Yes        |
| `/v1/todo/list`      | GET    | Retrieve all todos | ✅ Yes        |
| `/v1/todo/list/{id}` | PATCH  | Update todo by ID  | ✅ Yes        |
| `/v1/todo/list/{id}` | DELETE | Delete todo by ID  | ✅ Yes        |

### Todo Operations

#### 1. Create Todo

Create a new todo item with name and priority level.

[Video to create a TODO](https://github.com/user-attachments/assets/3afe67a9-0050-4eae-98db-c59d491ce728)

**Request:**

```bash
POST /v1/todo/create
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Complete project documentation",
  "priority": "high"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Complete project documentation",
    "priority": "high",
    "completed": false,
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-02-01T10:30:00.000Z",
    "updatedAt": "2026-02-01T10:30:00.000Z"
  }
}
```

**Validation Rules:**

- **name**: Required, 1-255 characters
- **priority**: Required, must be `low`, `medium`, or `high`
- **completed**: Optional, defaults to `false`

#### 2. Get All Todos

Retrieve all todos for the authenticated user with optional filtering and pagination.

[List TODOs](https://github.com/user-attachments/assets/d4786236-2a8d-49ad-aeca-a4ddd6f6a319)

**Request:**

```bash
GET /v1/todo/list?priority=high&page=1&limit=10
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Query Parameters:**

- **priority** (optional): Filter by priority (`low`, `medium`, `high`)
- **page** (optional): Page number, starts at 1 (default: 1)
- **limit** (optional): Items per page, 1-100 (default: varies)

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "todos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Complete project documentation",
        "priority": "high",
        "completed": false,
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "createdAt": "2026-02-01T10:30:00.000Z",
        "updatedAt": "2026-02-01T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Features:**

- Pagination support for large datasets
- Priority-based filtering
- User-specific data isolation (only see own todos)
- Sorted and paginated results

#### 3. Update Todo

Update an existing todo's name, priority, or completion status.

**Request:**

```bash
PATCH /v1/todo/list/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated task",
  "priority": "medium",
  "completed": true
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated task",
    "priority": "medium",
    "completed": true,
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-02-01T10:30:00.000Z",
    "updatedAt": "2026-02-01T10:35:00.000Z"
  }
}
```

**Update Options:**

- **name** (optional): Update todo name (1-255 characters)
- **priority** (optional): Change priority level
- **completed** (optional): Mark as complete/incomplete

**Notes:**

- All fields are optional (partial updates supported)
- `createdAt` remains unchanged
- `updatedAt` is automatically updated
- Only owner can update their todos

#### 4. Delete Todo

Permanently remove a todo from the system.

**Request:**

```bash
DELETE /v1/todo/list/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "message": "Todo deleted successfully"
  }
}
```

**Notes:**

- Deletion is permanent and cannot be undone
- Only owner can delete their todos
- Attempting to delete non-existent todo returns 404

### Todo Data Structure

```typescript
interface Todo {
  id: string; // UUID primary key
  name: string; // 1-255 characters
  priority: "low" | "medium" | "high"; // Priority level
  completed: boolean; // Completion status
  userId: string; // Owner of the todo
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
```

### Priority Levels

| Priority   | Description                                |
| ---------- | ------------------------------------------ |
| **low**    | Less urgent, can be done later             |
| **medium** | Normal priority, should be done soon       |
| **high**   | Urgent, should be done as soon as possible |

### Error Responses

#### 400 Bad Request

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "name": "Name must be between 1 and 255 characters",
    "priority": "Priority must be low, medium, or high"
  }
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "message": "No authentication token provided"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "message": "Todo not found or you don't have permission to access it"
}
```

### Todo Management Features

✅ **Full CRUD Operations**

- Create, Read, Update, Delete todos
- Atomic operations with transaction support

✅ **Data Validation**

- Name length constraints (1-255 characters)
- Priority enum validation
- UUID format validation for IDs
- Prevents XSS via HTML escaping

✅ **User Isolation**

- Users can only see and modify their own todos
- Prevents cross-user data access

✅ **Filtering & Pagination**

- Filter by priority level
- Paginate through large todo lists
- Customizable page size

✅ **Timestamps**

- Automatic `createdAt` tracking
- Automatic `updatedAt` on modifications
- ISO 8601 format for consistency

✅ **Flexible Updates**

- Partial updates supported (only include fields to update)
- No requirement to send entire object

---

## 🐳 Docker

### Using Docker Compose

The easiest way to run the entire stack locally with Docker.

#### Quick Start

```bash
# Using the setup script (recommended)
chmod +x set-up.sh
./set-up.sh

# Or manually with docker-compose

# drop containers & volumenes
sudo docker compose -f docker-compose.dev.yml down -v
# build the from images and Dockerfiles
sudo docker compose -f docker-compose.dev.yml build
# Run using .env.docker and using dev env
sudo docker compose --env-file .env.docker -f docker-compose.dev.yml up
```

#### Services

The Docker setup includes:

1. **PostgreSQL Database** (`postgres`)
   - Image: `postgres:16-alpine`
   - Port: `5432` (internal only)
   - Volume: `postgres_data` (persistent storage)
   - Automatic migrations on startup

2. **Node.js Application** (`app`)
   - Custom image from `Dockerfile.dev`
   - Port: `3001` (exposed)
   - Volume mounts for hot reload
   - Depends on database being healthy

#### Docker Features

- **Alpine-based Images**: Lightweight (smaller build sizes)
- **Non-root User**: Better security (nodejs user in app)
- **Health Checks**: Database readiness verification
- **Hot Reload**: Code changes reflect immediately
- **Volume Mounts**: `src/` and config files for live development
- **Network Isolation**: Services communicate via `todo-network`

## 🏗 Architecture

This project follows **Vertical Slice Architecture** combined with **Clean Architecture** principles for optimal maintainability and testability.

[Vertical Slice Architecture](https://github.com/user-attachments/assets/12515450-e9a6-4baf-89f9-71392f92331d)

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION LAYER (HTTP)                │
│  Routes, Controllers, Middlewares, Swagger      │
├─────────────────────────────────────────────────┤
│       APPLICATION LAYER (Business Logic)         │
│  Use Cases, DTOs, Validation, Services          │
├─────────────────────────────────────────────────┤
│     INFRASTRUCTURE LAYER (Data & External)      │
│  Database, Repositories, Services               │
└─────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── index.ts                          # Application entry point
│
├── application/                      # Business logic layer
│   ├── auth/                        # Authentication feature
│   │   ├── sign-up/
│   │   │   ├── SignUpUseCase.ts
│   │   │   ├── models/
│   │   │   │   └── SignUpDto.ts
│   │   │   └── ...
│   │   ├── login/
│   │   ├── refresh-token/
│   │   └── get-user/
│   │
│   ├── todo/                        # Todo feature
│   │   ├── create-todo/
│   │   ├── get-all-todos/
│   │   ├── get-todo-by-id/
│   │   ├── update-todo/
│   │   └── delete-todo-by-id/
│   │
│   └── shared/                      # Shared services
│       ├── models/                 # Domain interfaces
│       ├── infrastructure/         # JWT, Crypto, Config
│       └── sequelize/              # Database models & repos
│
└── presentation/                    # HTTP layer
    ├── controllers/                # Request handlers
    ├── routes/                     # Route definitions
    ├── middlewares/                # Auth, Validation
    └── swagger/                    # API documentation
```

### Layer Responsibilities

#### Presentation Layer (`/src/presentation`)

- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints and middleware chains
- **Middlewares**:
  - `AuthMiddleware`: JWT verification and user extraction
  - `ValidationMiddleware`: Zod schema validation
- **Swagger**: OpenAPI specification and UI configuration

#### Application Layer (`/src/application`)

- **Use Cases**: Core business logic for each feature
- **DTOs**: Data Transfer Objects with Zod validation
- **Models**: Domain interfaces and types
- Organized as **Vertical Slices**: each feature is independent

#### Infrastructure Layer (`/src/application/shared`)

- **Services**:
  - JWT token generation/verification
  - Password hashing with Argon2
  - Environment configuration
- **Database**:
  - Sequelize ORM models
  - Repository implementations
  - Connection management
- **Testing**: In-memory implementations for tests

### Benefits of This Architecture

- ✅ **Separation of Concerns**: Each layer has clear responsibility
- ✅ **Testability**: Easy to unit test use cases independently
- ✅ **Maintainability**: Changes isolated to specific layers
- ✅ **Scalability**: Easy to add new features
- ✅ **Flexibility**: Repository pattern allows different data sources
- ✅ **Type Safety**: Full TypeScript strict mode

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build           # Compile TypeScript to JavaScript

# Production
npm start              # Run compiled application

# Testing
npm test              # Run all tests
npm test:watch       # Run tests in watch mode
npm test:coverage    # Generate coverage report
npm test:debug       # Run tests with debugger

# Linting & Type Checking
npm run lint          # TypeScript type checking
```

---

## 🧪 Testing

### Acceptance Tests

Comprehensive integration tests located in `/tests/acceptance/`:

[video tesing](https://github.com/user-attachments/assets/6d2722fc-eddf-41dc-b076-002031e23626)

```bash
npm test

# Available test files:
# - auth.register.spec.ts
# - auth.login.spec.ts
# - auth.refresh-token.spec.ts
# - todo.create.spec.ts
# - todo.get-all.spec.ts
# - todo.update.spec.ts
# - todo.delete-by-id.spec.ts
```

### Test Coverage

- **Happy Path**: Normal operation scenarios
- **Validation**: Invalid inputs and edge cases
- **Authentication**: Token handling and authorization
- **Response Structure**: Verify response format
- **HTTP Status Codes**: Correct codes for all scenarios
- **Edge Cases**: Unicode, special characters, boundaries

### Running Tests

```bash
# All tests
npm test

# Watch mode (re-run on file changes)
npm test:watch

# Specific test file
npm test auth.register

# Coverage report
npm test:coverage
```

---

## 📊 Performance & Optimization

### Database Optimizations

- **Indexes**: Strategic indexes on frequently queried columns
- **UUID Primary Keys**: Better distribution than sequential IDs
- **Connection Pooling**: Efficient connection management via Sequelize

### API Optimizations

- **JWT Tokens**: Stateless authentication, no database queries for validation
- **CORS Caching**: Preflight responses cached by browsers
- **Pagination**: Limit database results for large datasets

### Response Compression

Configure `express-compression` for production:

```javascript
app.use(compression());
```

---

## 🔒 Security Best Practices

✅ **Password Security**

- Argon2 hashing (memory-hard algorithm)
- No plaintext passwords stored
- Minimum 8 characters enforced

✅ **Token Security**

- JWT with secrets
- HTTP-only cookies for refresh tokens
- Token family tracking for theft detection
- Automatic expiration

✅ **API Security**

- CORS protection
- Input validation with Zod
- SQL injection prevention via Sequelize ORM
- XSS protection (no inline scripts)

✅ **Environment Security**

- Secrets in .env (git-ignored)
- No secrets in version control
- Docker non-root user

---

## 📋 Checklist for Production

- [ ] Update `.env` with strong secrets (min 32 characters)
- [ ] Enable HTTPS/TLS in production
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set `NODE_ENV=production`
- [ ] Enable database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker-compose -f docker-compose.dev.yml logs postgres

# Verify credentials in .env
# Ensure POSTGRES_HOST is 'postgres' (Docker) or 'localhost' (local)
```

### Port Already in Use

```bash
# Change PORT in .env (default: 3001)
# Or kill process using port 3001:
# macOS/Linux: lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
# Windows: netstat -ano | findstr :3001
```

### Swagger UI Not Loading

```bash
# Ensure swaggerConfig.ts paths are correct
# Check: npm run build
# Verify: http://localhost:3001/api-docs
```

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test
npm test auth.register

# Debug mode
npm run test:debug
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**By Jose Carlos Huerta, happy coding! 🚀**
