# 🚀 Quick Start Testing Guide

## Backend API Status: ✅ WORKING
- Health endpoint: ✅ OK
- User registration: ✅ Working
- User login: ✅ Working  
- Authenticated endpoints: ✅ Working

## Testing Steps

### Option 1: Run Expo from Windows (Recommended)
Since WSL might have networking issues with Expo:

1. **Open Windows Terminal/PowerShell**
2. **Navigate to mobile directory:**
   ```powershell
   cd "C:\Users\danny\.vscode\new finess app\mobile"
   ```

3. **Start Expo:**
   ```powershell
   npx expo start
   ```

4. **Choose your testing method:**
   - Press `w` to open in web browser
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on phone

### Option 2: Test with Web Browser
If mobile testing has issues:

1. After starting Expo, press `w` to open in web browser
2. The app will run at http://localhost:8081
3. Use browser's device emulation (F12 → Mobile view)

### Option 3: Direct APK Build (Android)
```powershell
cd "C:\Users\danny\.vscode\new finess app\mobile"
npx expo run:android
```

## 🧪 Quick Test Checklist

### 1. Initial Launch Test
- [ ] App loads without crashing
- [ ] Shows login/signup screen
- [ ] Can tap buttons without errors

### 2. Offline Mode Test (No Backend Required)
- [ ] Tap "로그인" (Login) - should work offline
- [ ] Navigate to Home screen
- [ ] Browse workout routines
- [ ] Tap "상체 근력 운동" routine
- [ ] Press "운동 시작" (Start Workout)
- [ ] Add a set: tap exercise → "세트 추가" → enter weight/reps

### 3. Backend Integration Test
With backend running (http://localhost:3000):

**For Physical Device:**
1. Find your computer's IP:
   ```powershell
   ipconfig
   ```
   Look for IPv4 Address (e.g., 192.168.1.100)

2. Update `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```

3. Restart Expo with cache clear:
   ```powershell
   npx expo start -c
   ```

## 🎯 What Should Work

### ✅ Offline Features
- Browse routines
- Start workout sessions
- Track exercises locally
- View routine details
- Navigation between screens

### ✅ Online Features (with Backend)
- User registration/login
- Sync workout data
- View analytics
- Social feed
- Achievements

## 🐛 Common Issues & Quick Fixes

### "Network request failed"
**Solution:** App works offline! This error is expected if backend isn't accessible.

### Expo won't start from WSL
**Solution:** Run from Windows PowerShell instead

### Can't connect to backend from phone
**Solution:** 
1. Ensure phone and computer on same WiFi
2. Use computer's IP address, not localhost
3. Check Windows Firewall isn't blocking port 3000

### App crashes on workout start
**Solution:** Should be fixed, but if it happens:
1. Clear app data
2. Restart Expo with: `npx expo start -c`

## 📱 Test Account
If you need to test login:
- Email: test@example.com
- Password: Test123!@#

## 🎬 Quick Demo Flow
1. Launch app
2. Login (works offline)
3. Go to Home tab
4. Select "상체 근력 운동"
5. Press "운동 시작"
6. Tap "벤치프레스"
7. Add set: Weight: 60kg, Reps: 10
8. Complete workout
9. Check Profile tab for stats

---

## Need Help?
- Backend logs: Check terminal running `npm run dev`
- Mobile logs: Check Expo terminal
- API test: Run `./test-api.sh`