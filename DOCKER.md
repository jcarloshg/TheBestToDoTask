# Docker Setup Guide

This guide explains how to build and run the Todo application using Docker and Docker Compose.

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Run with Docker Compose

```bash
# Option 1: Using default values in docker-compose.yml
docker-compose up --build

# Option 2: Using custom environment file
cp .env.docker .env.docker.local
# Edit .env.docker.local with your configuration
docker-compose --env-file .env.docker.local up --build

# Option 3: Using existing .env file
docker-compose up --build
```

The application will be available at `http://localhost:3001` (or the configured PORT).

## Architecture

### Services

**postgres** - PostgreSQL 16 Alpine
- Runs on port 5432
- Automatically initializes with schema via Sequelize
- Data persisted in `postgres_data` volume
- Health checks ensure readiness before app starts

**app** - Node.js Application
- Runs on port 3001 (configurable)
- Depends on postgres service
- Multi-stage Dockerfile for optimized image size
- Non-root user for security
- Built-in health checks

### Network

Both services communicate over a Docker bridge network named `todo_network`. The application connects to PostgreSQL using the service name `postgres` as hostname (Docker's internal DNS resolution).

## Configuration

### Environment Variables

All configuration is environment-based. Set variables in one of these ways:

1. **Using `.env.docker`:**
   ```bash
   cp .env.docker .env.docker.local
   # Edit values as needed
   docker-compose --env-file .env.docker.local up
   ```

2. **Using system environment variables:**
   ```bash
   export PORT=3001
   export POSTGRES_PASSWORD=secure_password
   docker-compose up
   ```

3. **Directly in `docker-compose.yml`** (not recommended for production):
   Edit the `environment` section in the compose file.

### Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Application environment |
| `PORT` | 3001 | Application port |
| `POSTGRES_DB` | todo_db | Database name |
| `POSTGRES_USER` | admin | Database user |
| `POSTGRES_PASSWORD` | admin123456 | Database password |
| `POSTGRES_HOST` | postgres | Database host (service name) |
| `ACCESS_TOKEN_SECRET` | dev-access-secret-key | JWT access token secret |
| `REFRESH_TOKEN_SECRET` | dev-refresh-token-secret-key | JWT refresh token secret |
| `ACCESS_TOKEN_EXPIRY` | 24h | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | 7d | Refresh token lifetime |

### Production Recommendations

For production deployments:

1. **Generate strong JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use strong database passwords** (minimum 16 characters)

3. **Set `NODE_ENV=production`**

4. **Configure resource limits** (already in docker-compose.yml):
   - CPU: 1.0 limit, 0.5 reserved
   - Memory: 512M limit, 256M reserved

5. **Use secrets management** for sensitive data:
   - Docker Secrets (Swarm mode)
   - Docker Compose's `secrets` feature
   - External secret management (Vault, AWS Secrets Manager, etc.)

## Build

### Build Only (without running)

```bash
# Build both services
docker-compose build

# Build specific service
docker-compose build app
docker-compose build postgres
```

### Build with Custom Tag

```bash
docker-compose build --tag myregistry/todo-app:1.0.0 app
```

## Running

### Start Services

```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up postgres
docker-compose up app
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs postgres

# Follow logs (tail -f)
docker-compose logs -f app

# Last N lines
docker-compose logs --tail 50 app
```

### Stop Services

```bash
# Stop all services (containers remain)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers, volumes, and networks
docker-compose down -v

# Stop specific service
docker-compose stop app
```

## Health Checks

Both services include health checks:

### PostgreSQL Health Check
```bash
# Manual check
docker exec todo_postgres_db pg_isready -U admin

# Via docker-compose
docker-compose ps
# Check STATUS column for "healthy"
```

### Application Health Check
```bash
# Manual check
curl http://localhost:3001/health

# Via docker-compose
docker-compose ps
# Check STATUS column for "healthy"
```

## Debugging

### Access Container Shell

```bash
# App container
docker-compose exec app sh

# PostgreSQL container
docker-compose exec postgres psql -U admin -d todo_db
```

### View Container Resources

```bash
# Memory and CPU usage
docker stats

# Specific container
docker stats todo_app
```

### Inspect Logs

```bash
# View all logs
docker-compose logs

# Specific service with timestamps
docker-compose logs --timestamps app

# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100
```

## Development Workflow

### Hot Reloading (Local Development)

For development with hot reload, don't use Docker. Run locally:
```bash
npm install
npm run dev
docker-compose up postgres  # Just the database
```

### Development with Docker

If you need to use Docker for development:

1. Mount source code as volume:
   ```yaml
   app:
     volumes:
       - .:/app
   ```

2. Use development build:
   ```bash
   NODE_ENV=development docker-compose up
   ```

3. Rebuild when you make changes:
   ```bash
   docker-compose build app
   docker-compose restart app
   ```

## Troubleshooting

### App Cannot Connect to Database

**Problem:** "Unable to connect to the database" error

**Solution:**
1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose ps
   docker-compose logs postgres
   ```

2. Check connectivity:
   ```bash
   docker-compose exec app wget -O- http://postgres:5432
   ```

3. Verify environment variables:
   ```bash
   docker-compose exec app env | grep POSTGRES
   ```

### Port Already in Use

**Problem:** "port is already allocated"

**Solution:**
```bash
# Use different port
PORT=3002 docker-compose up

# Or stop the conflicting service
lsof -i :3001
kill -9 <PID>
```

### Database Won't Initialize

**Problem:** Database connection fails on startup

**Solution:**
1. Remove and recreate volumes:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Out of Memory

**Problem:** Container crashes with OOM

**Solution:**
1. Increase memory limit in `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1G
   ```

2. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## Performance Optimization

### Image Size

The multi-stage Dockerfile significantly reduces image size:
- Full build layers: ~800MB
- Final image: ~400MB (with node:20-alpine)

Check actual size:
```bash
docker images | grep todo_app
```

### Build Caching

Docker layer caching is optimized:
1. Lightweight base image (node:20-alpine)
2. Dependencies installed before source copy (changes less frequently)
3. `.dockerignore` excludes unnecessary files

Rebuild without cache if needed:
```bash
docker-compose build --no-cache
```

### Resource Limits

Pre-configured in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

Adjust based on your needs:
- Development: Can be reduced
- Production: May need to be increased for high load

## Security Best Practices

✅ **Implemented in these files:**
- Multi-stage build (minimal final image)
- Non-root user (UID 1001)
- No dev dependencies in production
- Alpine base image (smaller attack surface)
- Health checks (automatic restart of unhealthy containers)
- Resource limits (prevent DoS)
- Secrets passed via environment (not in images)

⚠️ **Not yet implemented (add to production):**
- Secret management system (Docker Secrets, HashiCorp Vault)
- Image scanning (Trivy, Grype)
- Network policies (Docker network isolation)
- SSL/TLS for inter-service communication
- Rate limiting and DDoS protection

## Docker Compose Advanced Usage

### Scale Services

```bash
# Run multiple app instances (requires load balancer)
docker-compose up --scale app=3
```

### Service Dependencies

The compose file enforces:
1. Database health check must pass
2. App depends on database being healthy
3. App won't start until database is ready

### Named Volumes

PostgreSQL data persists in `postgres_data` volume:
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect todo_postgres_data

# Backup volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## CI/CD Integration

### GitLab CI Example

```yaml
build:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker-compose build
    - docker-compose push

test:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker-compose up -d
    - docker-compose exec -T app npm test
    - docker-compose down
```

### GitHub Actions Example

```yaml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: docker/setup-buildx-action@v1
      - uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: ${{ secrets.REGISTRY }}/todo-app:latest
```

## Useful Commands Reference

```bash
# Build and run
docker-compose up --build -d

# View status
docker-compose ps

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Remove volumes
docker-compose down -v

# Access database
docker-compose exec postgres psql -U admin -d todo_db

# Access app shell
docker-compose exec app sh

# Rebuild specific service
docker-compose up --build app

# View resource usage
docker stats

# Prune unused resources
docker system prune -a
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Best Practices in Docker](https://github.com/nodejs/docker-node/blob/main/README.md#best-practices)
- [PostgreSQL Docker Documentation](https://hub.docker.com/_/postgres)
