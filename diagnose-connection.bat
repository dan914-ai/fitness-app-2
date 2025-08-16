@echo off
echo Korean Fitness App Connection Diagnostics
echo ========================================
echo.

echo 1. Finding your Windows IP addresses...
echo.
ipconfig | findstr /i "IPv4"
echo.

echo 2. Testing backend connection on different IPs...
echo.

echo Testing localhost:3000...
curl -s http://localhost:3000/health || echo FAILED
echo.

echo Testing 127.0.0.1:3000...
curl -s http://127.0.0.1:3000/health || echo FAILED
echo.

echo 3. Current .env configuration:
echo.
type mobile\.env | findstr API_URL
echo.

echo 4. IMPORTANT: Use one of the IPv4 addresses above (usually starts with 192.168)
echo    Example: If you see "IPv4 Address. . . : 192.168.1.100"
echo    Then update mobile\.env to use: http://192.168.1.100:3000/api
echo.

echo 5. To fix the connection:
echo    a) Note your IPv4 address from above (192.168.x.x)
echo    b) Edit mobile\.env file
echo    c) Change EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
echo    d) Restart the mobile app with: npx expo start --clear
echo.

pause