# Swagger API Documentation

## Overview

This project uses **Swagger/OpenAPI 3.0** to document all API endpoints. The interactive API documentation is available at:

```
http://localhost:3001/api-docs
```

## Features

✅ **Complete Endpoint Documentation**
- Authentication endpoints (register, login, refresh token, get profile)
- Todo CRUD operations (create, read, update, delete, list with filters)
- Health check endpoint

✅ **Interactive API Testing**
- Test endpoints directly from the Swagger UI
- Try out different request/response combinations
- See real-time response examples

✅ **Security Documentation**
- Bearer token authentication documented
- HTTP-only cookie handling explained
- Authorization requirements specified for each endpoint

✅ **Request/Response Schemas**
- Full schema definitions for all request bodies
- Complete response data structures
- Error response formats
- Pagination metadata

## Accessing the Documentation

### In Browser
1. Start the application: `npm run dev`
2. Open: `http://localhost:3001/api-docs`

### API Documentation Locations

- **Authentication Endpoints**: `/v1/auth/*`
  - `POST /register` - Create new user
  - `POST /login` - User login
  - `POST /refresh-token` - Refresh JWT token
  - `GET /me` - Get current user profile

- **Todo Endpoints**: `/v1/todo/*`
  - `POST /create` - Create new todo
  - `GET /list` - Get todos with filter & pagination
  - `GET /list/{id}` - Get specific todo
  - `PATCH /list/{id}` - Update todo
  - `DELETE /list/{id}` - Delete todo

- **Health**: `/health`
  - `GET /health` - API health check

## Usage Examples

### Using Swagger UI

1. **Expand an endpoint** to see full documentation
2. **Click "Try it out"** button to test
3. **Fill in parameters** (headers, path params, query params, body)
4. **Click "Execute"** to send the request
5. **See the response** with status code and data

### Example: Create a Todo

1. Go to `POST /v1/todo/create`
2. Click "Try it out"
3. Fill the request body:
   ```json
   {
     "name": "Complete project",
     "priority": "HIGH"
   }
   ```
4. Add Authorization header (Bearer token from login)
5. Click "Execute"

### Example: Get Todos with Filter

1. Go to `GET /v1/todo/list`
2. Click "Try it out"
3. Add parameters:
   - `priority`: high (optional)
   - `page`: 1 (optional, default: 1)
   - `limit`: 10 (optional, default: 10)
4. Add Authorization header
5. Click "Execute"

## Authentication in Swagger UI

1. Click the 🔒 **Authorize** button at the top
2. Enter your JWT access token in the format: `Bearer <your_token_here>`
3. Click "Authorize"
4. All subsequent requests will include this token automatically

## Swagger Configuration

The Swagger configuration is in:
```
src/presentation/swagger/swaggerConfig.ts
```

### Key Configuration:

- **OpenAPI Version**: 3.0.0
- **Info**: API title, version, contact details
- **Servers**: Development server configuration
- **Security Schemes**: Bearer token authentication
- **Component Schemas**: Reusable data models

### API Definitions:

API documentation is extracted from JSDoc comments in route files:
- `src/presentation/routes/auth.routes.ts`
- `src/presentation/routes/todo.routes.ts`
- `src/presentation/routes/health.routes.ts`

## Request/Response Examples

### Register a User

**Request:**
```bash
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "createdAt": "2025-01-31T12:00:00Z",
    "updatedAt": "2025-01-31T12:00:00Z"
  }
}
```

### Get Todos with Pagination

**Request:**
```bash
GET /v1/todo/list?priority=HIGH&page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "todos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Complete project",
        "priority": "HIGH",
        "completed": false,
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "createdAt": "2025-01-31T12:00:00Z",
        "updatedAt": "2025-01-31T12:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Updating Documentation

To add/modify API documentation:

1. **Edit the route file** in `src/presentation/routes/`
2. **Add JSDoc comments** with `@swagger` annotations above the route handler
3. **Follow OpenAPI 3.0 format** for the documentation
4. **Swagger will auto-generate** on app restart

### Example JSDoc Format:
```typescript
/**
 * @swagger
 * /v1/endpoint:
 *   post:
 *     summary: Endpoint description
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schema'
 */
```

## Testing Workflow

1. **Start the application**: `npm run dev`
2. **Open Swagger UI**: `http://localhost:3001/api-docs`
3. **Register a user**: Use `POST /v1/auth/register`
4. **Login**: Use `POST /v1/auth/login` to get access token
5. **Authorize**: Click 🔒 and paste the token
6. **Create todos**: Use `POST /v1/todo/create`
7. **Test filters**: Use `GET /v1/todo/list` with various filters
8. **Update/delete**: Test PATCH and DELETE endpoints

## Troubleshooting

### Swagger page is blank
- Check browser console for errors
- Verify `src/presentation/routes/*.ts` files have proper JSDoc syntax
- Restart the application

### Authorization not working
- Ensure JWT token format is correct: `Bearer <token>`
- Check token hasn't expired (run login again)
- Verify Bearer prefix is included

### Missing endpoints
- Ensure JSDoc `@swagger` comments are above route handlers
- Check YAML syntax in JSDoc comments
- Restart the application after adding documentation

## Resources

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger/OpenAPI Documentation](https://swagger.io/specification/)
- [swagger-jsdoc GitHub](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express GitHub](https://github.com/scottie1984/swagger-ui-express)
