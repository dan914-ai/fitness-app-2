# Korean Fitness App - Complete Startup Guide

## 🚀 Step-by-Step Instructions

### Step 1: Start Backend Server (Required)
```bash
# Open Terminal/PowerShell
cd "C:\Users\danny\.vscode\new finess app\backend"

# Install dependencies (if not done)
npm install

# Start the backend server
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
🚀 Server is running on port 3000
🏋️ Korean Fitness App Backend Ready!
```

### Step 2: Update Mobile App Configuration (For Physical Device)

#### For Testing on Physical Device:
1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update the mobile app's .env file:
   ```bash
   # Edit: C:\Users\danny\.vscode\new finess app\mobile\.env
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3000/api
   ```
   Example:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```

#### For Testing on Emulator/Simulator:
Keep the default:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 3: Start Mobile App
```bash
# Open NEW Terminal/PowerShell (keep backend running)
cd "C:\Users\danny\.vscode\new finess app\mobile"

# Install dependencies (if not done)
npm install

# Clear cache and start Expo
npx expo start -c
```

### Step 4: Run the App

#### Option A: Android/iOS Emulator
- Press `a` for Android emulator
- Press `i` for iOS simulator

#### Option B: Physical Device (Recommended)
1. Install "Expo Go" app on your phone
2. Make sure phone and computer are on same WiFi
3. Scan the QR code shown in terminal

#### Option C: Web Browser (Quick Test)
- Press `w` to open in web browser

## 🔧 Troubleshooting

### "Network request failed" Error
This is NORMAL if backend isn't accessible. The app works in offline mode!

### Backend Not Starting
1. Check if PostgreSQL Docker is running:
   ```bash
   docker ps
   ```
2. If not, start it:
   ```bash
   docker-compose up -d
   ```

### Mobile App Not Connecting to Backend
1. Check Windows Firewall - allow Node.js
2. Verify both devices on same network
3. Try using your computer's IP instead of localhost

### Expo Issues from WSL
Run from Windows PowerShell instead of WSL:
```powershell
# Use Windows PowerShell, not WSL
cd "C:\Users\danny\.vscode\new finess app\mobile"
npx expo start -c
```

## 📱 Quick Test Flow

1. **Backend Running?** Check http://localhost:3000/health in browser
2. **Launch App** - Should see login screen
3. **Tap "로그인"** - Works in offline mode
4. **Test Features:**
   - Home: Browse routines
   - 운동 시작: Check console for debug logs
   - 통계: Should not crash anymore
   - 메뉴: See new tier display

## 🎯 Debug Mode

To see what's happening:
1. **Backend Logs**: Check terminal running `npm run dev`
2. **Mobile Logs**: Check Expo terminal
3. **App Console**: Shake device or press `j` in Expo terminal

## 💡 Pro Tips

### Running Everything at Once
Create a batch file `start-app.bat`:
```batch
@echo off
echo Starting Korean Fitness App...

echo Starting Backend...
start cmd /k "cd /d C:\Users\danny\.vscode\new finess app\backend && npm run dev"

timeout /t 5

echo Starting Mobile App...
start cmd /k "cd /d C:\Users\danny\.vscode\new finess app\mobile && npx expo start -c"

echo App is starting! Check both terminal windows.
```

### Quick Backend Test
```bash
# Test if backend is working
curl http://localhost:3000/health
```

## 🚨 Important Notes

1. **Backend MUST be running** for full functionality
2. **Database must be running** (PostgreSQL in Docker)
3. **Use Windows PowerShell**, not WSL for Expo
4. **Physical device** needs your computer's IP address

## ✅ Success Indicators

- ✅ Backend shows "Server running on port 3000"
- ✅ Expo shows QR code
- ✅ App launches without crashes
- ✅ Can navigate between screens
- ✅ 운동 시작 shows debug logs in console
- ✅ 통계 page loads without crashing
- ✅ 메뉴 shows tier information