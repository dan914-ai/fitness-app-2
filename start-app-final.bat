@echo off
echo Korean Fitness App - Complete Solution
echo =====================================
echo.

echo Step 1: Restarting backend with proper network settings...
cd backend
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo Building backend...
call npm run build

echo Starting backend on all network interfaces...
start cmd /k "node dist/server.js"
cd ..

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 2: Auto-detecting your IP address...
powershell -ExecutionPolicy Bypass -File fix-connection.ps1

echo.
echo Step 3: Starting mobile app with fresh cache...
cd mobile
start cmd /k "npx expo start --clear"
cd ..

echo.
echo =====================================
echo All services starting!
echo =====================================
echo.
echo If you still see "서버 연결 불가":
echo 1. Check Windows Firewall - allow Node.js
echo 2. Run this as Administrator
echo 3. Make sure no VPN is active
echo.
pause