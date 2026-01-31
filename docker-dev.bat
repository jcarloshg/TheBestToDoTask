@echo off
REM ============================================================================
REM Docker Development Helper Script for Windows
REM ============================================================================
REM Usage: docker-dev.bat [command]
REM Commands:
REM   build       - Build Docker images
REM   up          - Start all services
REM   down        - Stop all services
REM   logs        - View application logs
REM   shell       - Access app container shell
REM   db          - Access PostgreSQL shell
REM   restart     - Restart services
REM   clean       - Remove containers and volumes
REM   prod        - Run with production configuration
REM   help        - Show this help message

setlocal enabledelayedexpansion

if "%1"=="" (
    set COMMAND=help
) else (
    set COMMAND=%1
)

goto %COMMAND%

:build
echo Building Docker images...
docker-compose build
if !errorlevel! equ 0 (
    echo Build complete
) else (
    echo Build failed
    exit /b 1
)
goto end

:up
echo Starting services...
docker-compose up -d
if !errorlevel! equ 0 (
    echo Services started
    echo Waiting for services to be healthy...
    timeout /t 5 /nobreak
    docker-compose ps
    echo.
    echo Application available at http://localhost:3001
) else (
    echo Failed to start services
    exit /b 1
)
goto end

:down
echo Stopping services...
docker-compose down
if !errorlevel! equ 0 (
    echo Services stopped
) else (
    echo Failed to stop services
    exit /b 1
)
goto end

:logs
echo Following application logs (Ctrl+C to exit)...
docker-compose logs -f app
goto end

:shell
echo Accessing app container shell...
docker-compose exec app sh
goto end

:db
echo Accessing PostgreSQL shell...
docker-compose exec postgres psql -U admin -d todo_db
goto end

:restart
echo Restarting services...
docker-compose restart
if !errorlevel! equ 0 (
    echo Services restarted
) else (
    echo Failed to restart services
    exit /b 1
)
goto end

:clean
set /p confirm="This will remove all containers and volumes! Are you sure? (yes/no): "
if "%confirm%"=="yes" (
    echo Cleaning up...
    docker-compose down -v
    if !errorlevel! equ 0 (
        echo Cleanup complete
    ) else (
        echo Cleanup failed
        exit /b 1
    )
) else (
    echo Cleanup cancelled
)
goto end

:prod
if not exist .env.docker.prod (
    echo .env.docker.prod not found
    exit /b 1
)
echo Starting with production configuration...
docker-compose --env-file .env.docker.prod up -d
if !errorlevel! equ 0 (
    echo Production services started
) else (
    echo Failed to start production services
    exit /b 1
)
goto end

:help
echo.
echo Docker Development Helper
echo.
echo Usage: docker-dev.bat [command]
echo.
echo Commands:
echo   build       - Build Docker images
echo   up          - Start all services
echo   down        - Stop all services
echo   logs        - View application logs
echo   shell       - Access app container shell
echo   db          - Access PostgreSQL shell
echo   restart     - Restart services
echo   clean       - Remove containers and volumes
echo   prod        - Run with production configuration
echo   help        - Show this help message
echo.
echo Examples:
echo   docker-dev.bat build
echo   docker-dev.bat up
echo   docker-dev.bat logs
echo   docker-dev.bat db
echo.
goto end

:end
endlocal
