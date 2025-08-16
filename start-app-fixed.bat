@echo off
echo Korean Fitness App Launcher (Fixed)
echo ====================================
echo.

echo Step 1: Starting PostgreSQL database...
echo Please make sure Docker Desktop is running!
docker-compose up -d postgres
if errorlevel 1 (
    echo ERROR: Failed to start database. Please ensure Docker Desktop is running.
    pause
    exit /b 1
)

echo.
echo Waiting for database to be ready...
timeout /t 8 /nobreak > nul

echo.
echo Step 2: Running database migrations...
cd "%~dp0backend"
call npx prisma migrate deploy
if errorlevel 1 (
    echo.
    echo Database migration failed. Running initial setup...
    call npx prisma migrate dev --name init
)

echo.
echo Step 3: Starting backend server...
start cmd /k "cd /d "%~dp0backend" && npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 4: Starting mobile app...
start cmd /k "cd /d "%~dp0mobile" && npx expo start"

echo.
echo ========================================
echo Application is starting up!
echo ========================================
echo.
echo Backend API: http://172.28.204.132:3000
echo Mobile App: http://localhost:8081
echo.
echo Database: 
echo - Host: localhost:5432
echo - Username: fitness_user
echo - Database: korean_fitness_db
echo.
echo To stop all services:
echo 1. Close the backend and mobile terminal windows
echo 2. Run: docker-compose down
echo.
pause