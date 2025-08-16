@echo off
echo Starting PostgreSQL database...
docker-compose up -d postgres
echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak > nul
echo.
echo Database should be running on localhost:5432
echo Username: fitness_user
echo Password: fitness_password
echo Database: korean_fitness_db
echo.
echo To stop the database, run: docker-compose down
pause