# Testing the App Without Backend

## Quick Fixes to Test the App

Since the app is crashing when pressing "운동 시작", here are some troubleshooting steps:

### 1. Check Console Logs
When running the app with `npm start`, look for error messages in:
- The terminal running Expo
- The browser console (if running in web)
- The Expo Go app logs (shake device to see developer menu)

### 2. Common Issues and Solutions

#### Network Request Failed
If you see network errors, the app is trying to connect to the backend but can't reach it.

**Solution**: The app now has offline mode support. The workout should start even without backend connection.

#### Navigation Error
If the app crashes on navigation:
- Make sure you're on the latest code
- Try clearing the Expo cache: `npx expo start -c`

### 3. Test in Web Browser First
The easiest way to debug is to run in web:
1. Start Expo: `npm start`
2. Press `w` to open in web browser
3. Open browser developer tools (F12)
4. Check the Console tab for errors

### 4. If Still Crashing

Try this minimal test:
1. In the RoutineDetailScreen, temporarily disable the API call
2. Or run the backend locally:
   ```bash
   cd backend
   npm run dev
   ```

### 5. Check Your Environment
Make sure:
- You're using Node.js 18 or higher
- All dependencies are installed: `npm install`
- Expo CLI is up to date: `npm install -g expo-cli@latest`

## What Should Happen

When you press "운동 시작":
1. A confirmation modal should appear
2. After confirming, it should navigate to WorkoutSessionScreen
3. You should see the workout tracking interface with:
   - Timer
   - Exercise list
   - Progress bar
   - Stats (volume, sets, duration)

## Debug Mode

The app now logs important information to the console:
- When starting a workout session
- API URLs being called
- Any errors that occur

Check these logs to identify the issue.