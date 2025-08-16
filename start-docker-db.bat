@echo off
echo Starting Docker Desktop...
echo Please make sure Docker Desktop is running.
echo.
echo Press any key once Docker Desktop is running...
pause > nul

echo.
echo Checking Docker status...
docker version > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo.
echo Removing existing container if present...
docker rm -f fitness-db 2> nul

echo.
echo Starting PostgreSQL database container...
docker run --name fitness-db ^
  -e POSTGRES_USER=fitness_user ^
  -e POSTGRES_PASSWORD=fitness_password ^
  -e POSTGRES_DB=korean_fitness_db ^
  -p 5432:5432 ^
  -d postgres:14

if %errorlevel% equ 0 (
    echo.
    echo Database container started successfully!
    echo Waiting for database to be ready...
    timeout /t 10 /nobreak > nul
    echo.
    echo Database should be ready now.
    echo You can now start the backend server.
) else (
    echo.
    echo ERROR: Failed to start database container.
)

pause