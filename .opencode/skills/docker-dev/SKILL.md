---
name: docker-dev
description: Docker compose commands for local development with PostgreSQL
---

## What I do
- `docker-compose -f docker-compose.dev.yml up -d` - Start containers in detached mode
- `docker-compose -f docker-compose.dev.yml down` - Stop all containers
- `docker-compose -f docker-compose.dev.yml logs -f` - View logs in real-time
- `docker-compose -f docker-compose.dev.yml up --build` - Rebuild and start containers

## When to use me
Use this when you need to run the development environment with Docker.
