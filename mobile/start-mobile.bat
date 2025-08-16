@echo off
echo Starting Korean Fitness Mobile App...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Expo...
echo.
echo Once Expo starts:
echo - Press 'a' to open in Android emulator
echo - Press 'i' to open in iOS simulator  
echo - Press 'w' to open in web browser
echo - Scan QR code with Expo Go app on your phone
echo.

REM Start Expo
call npx expo start

pause