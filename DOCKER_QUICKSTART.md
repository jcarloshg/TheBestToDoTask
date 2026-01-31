# Docker Quick Start Guide

Get the application running in seconds!

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- ~30 seconds and a terminal

## One-Line Start

```bash
# macOS / Linux
docker-compose up --build

# Windows (PowerShell)
docker-compose up --build

# Using helper script (macOS / Linux)
./docker-dev.sh up

# Using helper script (Windows)
docker-dev.bat up
```

Done! Visit `http://localhost:3001`

## Common Tasks

### View Application Logs
```bash
./docker-dev.sh logs    # macOS / Linux
docker-dev.bat logs     # Windows
# Or manually:
docker-compose logs -f app
```

### Access Database
```bash
./docker-dev.sh db      # macOS / Linux
docker-dev.bat db       # Windows
# Or manually:
docker-compose exec postgres psql -U admin -d todo_db
```

### Stop Services
```bash
./docker-dev.sh down    # macOS / Linux
docker-dev.bat down     # Windows
# Or manually:
docker-compose down
```

### Rebuild After Code Changes
```bash
./docker-dev.sh build && ./docker-dev.sh up
# Or manually:
docker-compose up --build
```

### Clean Everything (Start Fresh)
```bash
./docker-dev.sh clean   # macOS / Linux
docker-dev.bat clean    # Windows
# Or manually:
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Use a different port
PORT=3002 docker-compose up

# Or find what's using port 3001
lsof -i :3001  # macOS / Linux
netstat -ano | findstr :3001  # Windows
```

### Database Won't Connect
```bash
# Check database health
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart everything clean
docker-compose down -v && docker-compose up --build
```

### App Keeps Crashing
```bash
# View detailed logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep POSTGRES
```

## Environment Configuration

### Development (Default)
```bash
docker-compose up
```
Uses default values from `docker-compose.yml`

### Production
```bash
docker-compose --env-file .env.docker.prod up

# Or using helper:
./docker-dev.sh prod  # macOS / Linux
docker-dev.bat prod   # Windows
```

### Custom Configuration
Create `.env.docker.custom`:
```bash
NODE_ENV=production
PORT=3001
POSTGRES_DB=custom_db
POSTGRES_PASSWORD=your_secure_password
```

Then run:
```bash
docker-compose --env-file .env.docker.custom up
```

## API Testing

### Sign Up
```bash
curl -X POST http://localhost:3001/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### Login
```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### Create Todo (Replace TOKEN with access_token from login)
```bash
curl -X POST http://localhost:3001/v1/todo/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"My Todo","priority":"high"}'
```

## Helper Script Commands

### macOS / Linux
```bash
./docker-dev.sh build       # Build images
./docker-dev.sh up          # Start services
./docker-dev.sh down        # Stop services
./docker-dev.sh logs        # View logs
./docker-dev.sh shell       # Access app shell
./docker-dev.sh db          # Access database
./docker-dev.sh restart     # Restart services
./docker-dev.sh clean       # Remove containers and volumes
./docker-dev.sh prod        # Run production config
./docker-dev.sh help        # Show help
```

### Windows
```bash
docker-dev.bat build        # Build images
docker-dev.bat up           # Start services
docker-dev.bat down         # Stop services
docker-dev.bat logs         # View logs
docker-dev.bat shell        # Access app shell
docker-dev.bat db           # Access database
docker-dev.bat restart      # Restart services
docker-dev.bat clean        # Remove containers and volumes
docker-dev.bat prod         # Run production config
docker-dev.bat help         # Show help
```

## Development Workflow

### Option 1: Use Docker for Everything
```bash
docker-compose up                    # Start full stack
# Make code changes
docker-compose up --build            # Rebuild and restart
```

### Option 2: Local Dev + Docker Database
```bash
# Terminal 1: Just the database
cd database && docker-compose -f docker-compose.yml up

# Terminal 2: Local development
npm install
npm run dev
```

This gives you hot reload while using the same database as production.

## Docker Compose Files

- **Dockerfile** - Multi-stage Node.js build
- **docker-compose.yml** - Orchestrates app + PostgreSQL
- **.dockerignore** - Excludes unnecessary files from build
- **.env.docker** - Development environment template
- **.env.docker.prod** - Production environment template

## Performance Tips

1. **Speed up rebuilds** - Changes to dependencies trigger full rebuild
   ```bash
   # Quick restart without rebuild
   docker-compose restart app

   # Rebuild only if you changed package.json
   docker-compose up --build
   ```

2. **Free up disk space**
   ```bash
   docker-compose down -v              # Remove volumes
   docker system prune -a              # Clean unused images
   ```

3. **View resource usage**
   ```bash
   docker stats
   ```

## For Production Deployment

See [DOCKER.md](DOCKER.md) for:
- Security best practices
- Resource configuration
- Secrets management
- Load balancing
- CI/CD integration
- Backup and recovery

## Getting Help

```bash
# Show help
./docker-dev.sh help         # macOS / Linux
docker-dev.bat help          # Windows

# View compose documentation
docker-compose --help
docker-compose up --help

# Check detailed logs
docker-compose logs --tail 100 app
```

## Next Steps

- Read [DOCKER.md](DOCKER.md) for comprehensive documentation
- Check [CLAUDE.md](CLAUDE.md) for project architecture
- Review [README.md](README.md) for API documentation
