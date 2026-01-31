#!/bin/bash

# Docker Development Setup Script
# Best practices: error handling, checks, colored output

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}✗ Docker is not installed${NC}"
  exit 1
fi

# Check .env.docker exists
if [[ ! -f .env.docker ]]; then
  echo -e "${RED}✗ .env.docker file not found${NC}"
  exit 1
fi

echo -e "${BLUE}ℹ Starting Docker development environment...${NC}"

# Down and remove volumes
echo -e "${BLUE}ℹ Cleaning up containers and volumes...${NC}"
sudo docker compose -f docker-compose.dev.yml down -v
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Build
echo -e "${BLUE}ℹ Building Docker images...${NC}"
sudo docker compose -f docker-compose.dev.yml build
echo -e "${GREEN}✓ Build complete${NC}"

# Start
echo -e "${BLUE}ℹ Starting services...${NC}"
sudo docker compose --env-file .env.docker -f docker-compose.dev.yml up