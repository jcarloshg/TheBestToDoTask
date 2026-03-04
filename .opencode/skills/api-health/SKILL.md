---
name: api-health
description: Check API health and access Swagger documentation
---

## What I do
- Health check endpoint
- Swagger UI for interactive API documentation

## Endpoints
- Health: `http://localhost:3001/health`
- Swagger: `http://localhost:3001/api-docs`

## Commands
```bash
# Check health
curl http://localhost:3001/health

# Open Swagger in browser
xdg-open http://localhost:3001/api-docs
```

## When to use me
Use this when you need to verify the API is running or access API documentation.
