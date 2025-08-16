# Korean Fitness App Connection Fixer
Write-Host "Korean Fitness App - Auto Connection Fix" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Get the primary IPv4 address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi", "Ethernet" | 
    Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" } | 
    Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    # Fallback method
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | 
        Select-Object -First 1).IPAddress
}

Write-Host "Found your IP address: $ipAddress" -ForegroundColor Yellow
Write-Host ""

# Update the .env file
$envPath = ".\mobile\.env"
$envContent = Get-Content $envPath -Raw
$newApiUrl = "http://${ipAddress}:3000/api"

# Replace the API URL
$newContent = $envContent -replace 'EXPO_PUBLIC_API_URL=.*', "EXPO_PUBLIC_API_URL=$newApiUrl"

# Write back to file
Set-Content -Path $envPath -Value $newContent -NoNewline

Write-Host "Updated .env file with new API URL: $newApiUrl" -ForegroundColor Green
Write-Host ""

# Test the connection
Write-Host "Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://${ipAddress}:3000/health" -Method Get
    Write-Host "✅ Backend is accessible!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend not accessible on $ipAddress" -ForegroundColor Red
    Write-Host "Make sure the backend is running!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure backend is running (it should be listening on 0.0.0.0:3000)"
Write-Host "2. Restart the mobile app with: npx expo start --clear"
Write-Host "3. The app should now connect successfully!"
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")