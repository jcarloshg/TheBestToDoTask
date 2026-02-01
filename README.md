# 📝 The Best To Do Task - ToDo API

![Node.js](https://img.shields.io/badge/Node.js-v20+-green)
![Express](https://img.shields.io/badge/Express-v4.18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED)

---

## 📋 Overview

**The Best To Do Task** is a production-ready ToDo API built with Node.js, Express, and PostgreSQL. It provides secure user authentication using JWT tokens and complete Todo management with CRUD operations. The API implements Vertical Slice Architecture for maintainability and follows clean architecture principles with comprehensive API documentation via Swagger/OpenAPI. Perfect for learning production-grade backend development or as a foundation for task management applications.

---

## 🚀 Quickstart

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Latest version
- **Docker & Docker Compose**: (Optional, for containerized setup)
- **PostgreSQL**: v16 or higher (if running locally without Docker)

### Installation

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

### Using the Setup Script

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

**What `set-up.sh` does:**

- Validates Docker and Docker Compose are installed
- Checks for `.env.docker` file with required configurations
- Removes existing containers and volumes for a clean start
- Builds Docker images from Dockerfiles
- Starts services in the correct order (database first, then app)
- Runs SQL migration scripts automatically during startup
- Provides colored output with status indicators

### Verification

Once running, verify the API is working:

```bash
# Health check
curl http://localhost:3001/health

# Access Swagger documentation
open http://localhost:3001/api-docs
```

---

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

### Database Setup

The database is initialized through migration scripts located in `/database/migrations/`. These are automatically executed when:

1. **Using Docker Compose**: Migrations run on container startup
2. **Running Locally**: Execute migrations manually:

```bash
# Migrations are auto-run by Sequelize when the app starts
# To run migrations manually (if needed):
npm run migrate
```

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

### Accessing Swagger UI

Once the API is running, access the interactive API documentation:

```
http://localhost:3001/api-docs
```

### Features

- **Interactive Testing**: Test endpoints directly from the browser
- **Request/Response Examples**: See example requests and responses
- **Schema Validation**: Understand required fields and constraints
- **Security Documentation**: Bearer token authentication explained
- **Status Codes**: All possible HTTP responses documented

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
