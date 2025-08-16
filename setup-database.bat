@echo off
echo Setting up PostgreSQL database with Docker...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/4] Starting PostgreSQL container...
docker run --name fitness-db ^
  -e POSTGRES_USER=fitness_user ^
  -e POSTGRES_PASSWORD=fitness_password ^
  -e POSTGRES_DB=korean_fitness_db ^
  -p 5432:5432 ^
  -d postgres:14

if %errorlevel% neq 0 (
    echo Container might already exist. Trying to start it...
    docker start fitness-db
)

echo.
echo [2/4] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [3/4] Running database migrations...
cd backend
call npx prisma migrate deploy

echo.
echo [4/4] Seeding database with sample data...
call npx prisma db seed

echo.
echo ========================================
echo Database setup complete!
echo PostgreSQL is running on port 5432
echo ========================================
echo.
echo You can now start the backend server with:
echo   cd backend
echo   npm run dev
echo.
pause