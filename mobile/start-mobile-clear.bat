@echo off
echo Starting Korean Fitness Mobile App with cache clear...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Clearing Metro cache to fix white screen issue...
echo.

REM Clear all caches
if exist "node_modules\.cache" (
    echo Removing node_modules cache...
    rmdir /s /q "node_modules\.cache"
)

echo Starting Expo with cleared cache...
echo.
echo Once Expo starts:
echo - Press 'a' to open in Android emulator
echo - Press 'i' to open in iOS simulator  
echo - Press 'w' to open in web browser
echo - Scan QR code with Expo Go app on your phone
echo.
echo If you still see a white screen:
echo - Press Ctrl+C to stop
echo - Run this script again
echo - Check browser console (F12) for errors
echo.

REM Start Expo with clear cache
call npx expo start --clear

pause