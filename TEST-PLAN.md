# Korean Fitness App - Test Plan

## 🧪 Testing Instructions

### Prerequisites
1. Backend server running on port 3000 ✅
2. Expo server running on port 8081 ✅
3. PostgreSQL database with seed data ✅

### Testing on Emulator/Simulator
1. Press `a` for Android emulator or `i` for iOS simulator in the Expo terminal
2. The app should launch automatically

### Testing on Physical Device
1. Install Expo Go app on your phone
2. Make sure your phone and computer are on the same WiFi network
3. Update `/mobile/.env` with your computer's IP address:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api
   ```
4. Restart Expo with `npx expo start -c`
5. Scan the QR code with Expo Go app

## 📱 Test Scenarios

### 1. Authentication Flow (Offline Mode)
Since we're in offline mode initially:
- [ ] Launch the app
- [ ] You should see the Auth screen with "로그인" (Login) and "회원가입" (Sign up) buttons
- [ ] Try logging in - it should work in offline mode
- [ ] You should be redirected to the Home screen

### 2. Home Screen
- [ ] Verify you can see the bottom navigation with 5 tabs:
  - 홈 (Home)
  - 운동 (Workout)
  - 소셜 (Social)
  - 챌린지 (Challenges)
  - 프로필 (Profile)
- [ ] Check that you can see pre-defined workout routines
- [ ] Tap on a routine (e.g., "상체 근력 운동")

### 3. Routine Detail Screen
- [ ] Verify routine information is displayed
- [ ] Check muscle visualization diagram
- [ ] See list of exercises
- [ ] Tap "운동 시작" (Start Workout) button

### 4. Workout Session Screen
- [ ] Verify you're in the workout session
- [ ] You should see the list of exercises from the routine
- [ ] Tap on an exercise to track it
- [ ] Add sets with weight and reps:
  - Tap "세트 추가" (Add Set)
  - Enter weight (e.g., 60)
  - Enter reps (e.g., 10)
  - Tap "저장" (Save)
- [ ] Complete at least one exercise
- [ ] Try completing the workout

### 5. Social Features (Requires Backend)
If backend is accessible:
- [ ] Navigate to Social tab
- [ ] Check if feed loads
- [ ] Try creating a post
- [ ] Test like/comment functionality

### 6. Analytics
- [ ] Navigate to Profile tab
- [ ] Check if analytics data displays
- [ ] View workout history
- [ ] Check achievements section

### 7. Offline/Online Sync
- [ ] Start a workout in offline mode
- [ ] Complete some exercises
- [ ] If backend becomes available, check if data syncs

## 🐛 Common Issues & Solutions

### App Crashes on "운동 시작"
- This should be fixed with offline mode
- If it still crashes, check console for errors

### Network Request Failed
- This is expected if backend isn't accessible from device
- App should work in offline mode
- For physical device: Update .env with computer's IP

### Empty Screens
- Check if data is loading from AsyncStorage
- Pull to refresh on list screens

### Backend Connection Issues
1. Verify backend is running: `curl http://localhost:3000/health`
2. For physical device:
   - Find computer IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Update mobile/.env
   - Restart Expo

## 📊 Expected Results

### Offline Mode
- ✅ App launches without backend
- ✅ Can browse routines
- ✅ Can start and track workouts
- ✅ Data persists in AsyncStorage
- ✅ No crashes on network errors

### Online Mode (with Backend)
- ✅ User registration/login
- ✅ Workout data syncs to database
- ✅ Social features work
- ✅ Analytics show real data
- ✅ Achievements track progress

## 📝 Test Log Template

```
Date: _______
Device: _______ (Emulator/Physical)
Backend: _______ (Online/Offline)

Test Results:
- [ ] App launches successfully
- [ ] Navigation works
- [ ] Can start workout
- [ ] Can track exercises
- [ ] Data persists
- [ ] No crashes

Issues Found:
1. _______
2. _______

Notes:
_______
```