# Google Drive Transfer Guide

## Step 1: Prepare Files on OLD Computer

### Option A: Upload Entire Folder (Easiest)
1. Navigate to `C:\Users\danny\.vscode\`
2. Right-click on `new finess app` folder
3. If you have Google Drive Desktop:
   - Select "Share with Google Drive"
4. Or manually:
   - Compress to ZIP: Right-click → "Send to" → "Compressed (zipped) folder"
   - Upload the ZIP to Google Drive

### Option B: Create Clean Archive (Recommended)
1. Copy the `new finess app` folder to Desktop
2. Delete these folders inside the copy to save space:
   - `backend/node_modules`
   - `mobile/node_modules`
   - `mobile/.expo`
   - `backend/dist`
   - Any `.log` files
3. Compress the cleaned folder to ZIP
4. Upload to Google Drive

**Important**: The `.env` files contain your API keys - make sure they're included!

## Step 2: Download on NEW Computer

1. Download the folder/ZIP from Google Drive
2. Extract to `C:\Users\[YourUsername]\.vscode\new finess app`

## Step 3: Setup on NEW Computer

### Install Required Software:
```
1. Node.js (v18+): https://nodejs.org/
2. Git: https://git-scm.com/
3. VS Code: https://code.visualstudio.com/
4. Android Studio: https://developer.android.com/studio
```

### Install Project Dependencies:
Open Command Prompt or Terminal in the project folder:

```bash
# Install backend dependencies
cd backend
npm install

# Setup database
npx prisma generate
npx prisma db push

# Install mobile dependencies
cd ../mobile
npm install
```

### Start the Application:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npx expo start --clear
```

## Files to Double-Check

Make sure these files exist after transfer:

✅ `/backend/.env` - Backend configuration
✅ `/mobile/.env` - Mobile configuration  
✅ `/backend/prisma/schema.prisma` - Database schema
✅ `/mobile/src/data/exerciseDatabase.ts` - Exercise data

## Quick Test

1. Open Expo Go on your phone
2. Scan the QR code from Terminal 2
3. Try the "테스트 계정 자동 생성" button
4. Or use: test@example.com / test123456

## Troubleshooting

**If "Cannot connect to server":**
- Run `npx expo start --clear` to clear cache
- Check that both .env files transferred correctly
- Make sure you ran `npm install` in both folders

**If database errors:**
- Install PostgreSQL
- Run `npx prisma db push` in backend folder

**File size too large for Google Drive:**
- Delete node_modules folders before zipping
- They'll be recreated with `npm install`