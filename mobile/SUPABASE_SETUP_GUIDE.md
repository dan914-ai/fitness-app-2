# Supabase Backend Setup Guide

## 🚀 Current Status
The app is now configured to connect to Supabase for the weight progression algorithm. Here's what has been set up:

### ✅ Completed Setup
1. **Authentication System** - Real auth enabled in `useAuth.ts`
2. **Progression Service** - Connected to Supabase with local fallback
3. **DOMS Survey Screen** - Connected and accessible from Home screen
4. **Database Migration Script** - Ready to create required tables
5. **Hybrid Architecture** - Works offline with enhanced features when online

## 📋 Setup Steps

### Step 1: Run Database Migration
1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to SQL Editor
3. Copy and paste the contents of `/supabase/migrations/001_create_progression_tables.sql`
4. Click "Run" to create the tables

### Step 2: Configure Environment Variables
Make sure your `.env` file has:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Test Authentication
1. Start the app: `npm run web`
2. You'll see the login screen (auth is now required)
3. Options for testing:
   - Create a new account with "회원가입" (Register)
   - Use test account: click "테스트 계정 자동 생성"
   - Use existing account if you have one

### Step 4: Test DOMS Survey
1. Once logged in, go to Home screen
2. Click "회복 설문" button (previously "DOMS")
3. Complete the recovery survey
4. Data will be saved to Supabase `user_doms_data` table

### Step 5: Test Weight Progression
1. Start a workout from Home screen
2. Select an exercise
3. The app will now:
   - Try to get progression suggestion from Supabase (using recovery data)
   - Fall back to local progression if Supabase unavailable
   - Show smart weight recommendations based on your history

## 🏗️ Architecture Overview

### Hybrid Offline/Online Design
```
User Action
    ↓
Check Auth Status
    ↓
Authenticated? ──Yes──→ Use Supabase Services
    ↓ No                      ↓ (with fallback)
    ↓                         ↓
Local Storage ←──────── Fallback if offline
```

### Data Flow
1. **Recovery Data**: DOMS Survey → Supabase → Progression Algorithm
2. **Workout Data**: Local Storage → Sync to Supabase (when online)
3. **Progression**: Supabase Algorithm (primary) → Local Algorithm (fallback)

## 🔧 Troubleshooting

### Authentication Issues
- **Email not confirmed**: Supabase may require email verification
- **Test mode**: App will use mock auth for testing if needed
- **Solution**: Use test account creation button for quick testing

### Progression Not Working
1. Check if user is authenticated: `supabase.auth.getUser()`
2. Verify tables exist in Supabase
3. Check console for errors
4. Fallback to local progression should work regardless

### DOMS Survey Not Saving
1. Verify user is logged in
2. Check network connection
3. Verify `user_doms_data` table exists
4. Check RLS policies are enabled

## 📊 Database Schema

### user_doms_data
- Recovery metrics (sleep, energy, soreness, motivation)
- Body part specific soreness
- Daily survey data

### user_session_data  
- Workout RPE (Rate of Perceived Exertion)
- Session duration and load
- Exercise count

## 🎯 Next Steps

1. **Deploy Edge Function** (Optional)
   - For advanced progression algorithm
   - Located in `/supabase/functions/progression-algorithm`

2. **Enable Real-time Sync**
   - Sync local workout data to cloud
   - Enable multi-device support

3. **Add Social Features**
   - Share workouts
   - Community challenges
   - Leaderboards

## 💡 Tips

- The app works fully offline - Supabase enhances but isn't required
- Local data is preserved even when switching to online mode
- Test with "테스트 계정" button for quick development
- Use Chrome DevTools Network tab to verify API calls

## 📱 Testing on Different Platforms

### Web (Recommended for testing)
```bash
npm run web
```

### iOS
```bash
npx expo run:ios
```

### Android
```bash
npx expo run:android
```

## 🔒 Security Notes

- RLS (Row Level Security) is enabled on all tables
- Users can only access their own data
- Anonymous access is disabled
- All API calls require authentication

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase dashboard for table creation
3. Test with diagnostic screen: Login → "연결 진단"
4. Check network requests in browser DevTools

## ✨ Features Now Available

With Supabase connected, you now have:
- ✅ Smart weight progression based on recovery metrics
- ✅ Persistent user accounts across devices
- ✅ Recovery tracking with DOMS surveys
- ✅ RPE-based workout intensity monitoring
- ✅ Cloud storage for workout history
- ✅ Secure authentication with email/password

The app maintains full offline functionality while adding these enhanced features when online!