# Supabase Authentication Issue Fix

## Problem
The Supabase project (nwpyliujuimufkfjolsj) is rejecting email addresses with the error:
- `Email address "test@example.com" is invalid`
- This affects both sign up and sign in operations

## Root Cause
This is likely due to one of the following Supabase project settings:
1. **Email domain restrictions** - The project may have allowlist/blocklist for email domains
2. **Email validation rules** - Strict email validation that rejects common test emails
3. **Auth provider configuration** - The project might require specific auth providers

## Temporary Workaround (Implemented)
The app now includes a mock authentication fallback:
- When Supabase rejects the test account, the app uses local mock auth
- This allows testing the app functionality without Supabase auth
- File: `mobile/src/utils/testAuthWorkaround.ts`

## Permanent Fix Options

### Option 1: Fix Supabase Project Settings
1. Go to https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/auth/configuration
2. Check the following settings:
   - **Email Auth**: Ensure it's enabled
   - **Email Restrictions**: Remove any domain restrictions
   - **Confirm Email**: Consider disabling for development
   - **Secure Email Change**: Disable for testing

### Option 2: Use a Different Supabase Project
1. Create a new Supabase project at https://supabase.com
2. Update the environment variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-new-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   ```
3. The new project should have default settings that allow test emails

### Option 3: Use Backend Auth Instead
Since the backend has its own auth system:
1. Disable Supabase auth in the mobile app
2. Use only the backend API for authentication
3. Update `mobile/src/services/auth.service.ts` to use backend auth exclusively

## Testing the Fix
After implementing any of the above fixes:
1. Restart the Expo development server: `npx expo start -c`
2. Try creating a test account
3. Verify login works correctly

## Current Status
- ✅ Mock auth workaround implemented
- ✅ App can run in test mode without Supabase auth
- ⚠️ Real user authentication requires fixing Supabase settings
- ℹ️ Backend auth (localhost:3000) works independently of Supabase