---
name: db-migrations
description: Manage PostgreSQL database migrations
---

## What I do
- Start PostgreSQL container for migrations
- Execute migration SQL files

## Commands
```bash
# Start database container
docker-compose -f database/docker-compose.yml up -d

# Run a migration
docker-compose -f database/docker-compose.yml exec postgres psql -U postgres -d todo_db -f /migrations/<migration-file>.sql
```

## Migration Location
`database/migrations/`

## Naming Convention
`{YYYY-MM-DD}.{sequence}.{description}.sql`

Examples:
- `2025-01-30.01.table-for-user.sql`
- `2025-01-30.02.create-table-for-todo.sql`

## When to use me
Use this when you need to create or run database migrations.
