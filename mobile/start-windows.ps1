# PowerShell script to help with WSL2 networking
Write-Host "Starting Korean Fitness App..." -ForegroundColor Green

# Get WSL2 IP
$wslIp = (wsl hostname -I).Trim()
Write-Host "WSL2 IP: $wslIp" -ForegroundColor Yellow

# Start the app
Write-Host "`nTo access the app:" -ForegroundColor Cyan
Write-Host "1. Web Browser: http://${wslIp}:19006" -ForegroundColor White
Write-Host "2. Expo Go App: exp://${wslIp}:8081" -ForegroundColor White
Write-Host "`nStarting Expo..." -ForegroundColor Green

# Navigate to mobile directory and start
cd mobile
npm start