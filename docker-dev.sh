#!/bin/bash

# ============================================================================
# Docker Development Helper Script
# ============================================================================
# Usage: ./docker-dev.sh [command]
# Commands:
#   build       - Build Docker images
#   up          - Start all services
#   down        - Stop all services
#   logs        - View application logs
#   shell       - Access app container shell
#   db          - Access PostgreSQL shell
#   restart     - Restart services
#   clean       - Remove containers and volumes
#   prod        - Run with production configuration
#   help        - Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default command
COMMAND=${1:-help}

# Helper functions
print_header() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Commands
case $COMMAND in
    build)
        print_header "Building Docker images..."
        docker-compose build
        print_success "Build complete"
        ;;

    up)
        print_header "Starting services..."
        docker-compose up -d
        print_success "Services started"
        print_header "Waiting for services to be healthy..."
        sleep 5
        docker-compose ps
        echo ""
        print_success "Application available at http://localhost:3001"
        ;;

    down)
        print_header "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        ;;

    logs)
        print_header "Following application logs (Ctrl+C to exit)..."
        docker-compose logs -f app
        ;;

    shell)
        print_header "Accessing app container shell..."
        docker-compose exec app sh
        ;;

    db)
        print_header "Accessing PostgreSQL shell..."
        docker-compose exec postgres psql -U admin -d todo_db
        ;;

    restart)
        print_header "Restarting services..."
        docker-compose restart
        print_success "Services restarted"
        ;;

    clean)
        print_warning "This will remove all containers and volumes!"
        read -p "Are you sure? (yes/no): " -r
        echo
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_header "Cleaning up..."
            docker-compose down -v
            print_success "Cleanup complete"
        else
            print_warning "Cleanup cancelled"
        fi
        ;;

    prod)
        print_header "Starting with production configuration..."
        if [ ! -f .env.docker.prod ]; then
            print_error ".env.docker.prod not found"
            exit 1
        fi
        docker-compose --env-file .env.docker.prod up -d
        print_success "Production services started"
        ;;

    help|--help|-h)
        echo ""
        echo -e "${BLUE}Docker Development Helper${NC}"
        echo ""
        echo "Usage: ./docker-dev.sh [command]"
        echo ""
        echo "Commands:"
        echo "  ${GREEN}build${NC}       - Build Docker images"
        echo "  ${GREEN}up${NC}          - Start all services"
        echo "  ${GREEN}down${NC}        - Stop all services"
        echo "  ${GREEN}logs${NC}        - View application logs"
        echo "  ${GREEN}shell${NC}       - Access app container shell"
        echo "  ${GREEN}db${NC}          - Access PostgreSQL shell"
        echo "  ${GREEN}restart${NC}     - Restart services"
        echo "  ${GREEN}clean${NC}       - Remove containers and volumes"
        echo "  ${GREEN}prod${NC}        - Run with production configuration"
        echo "  ${GREEN}help${NC}        - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./docker-dev.sh build"
        echo "  ./docker-dev.sh up"
        echo "  ./docker-dev.sh logs"
        echo "  ./docker-dev.sh db"
        echo ""
        ;;

    *)
        print_error "Unknown command: $COMMAND"
        echo "Run './docker-dev.sh help' for available commands"
        exit 1
        ;;
esac
