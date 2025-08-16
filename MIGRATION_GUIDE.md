# Project Migration Guide

## Files to Transfer

### Method 1: Using Git (Recommended)

1. **On OLD Computer**:
   ```bash
   # We already committed everything
   # Push to GitHub if you have a remote:
   git push origin cleanup-20250729
   ```

2. **On NEW Computer**:
   ```bash
   # Clone your repository
   git clone [your-repo-url]
   cd "new finess app"
   git checkout cleanup-20250729
   ```

### Method 2: Manual Transfer

Transfer these directories:
- `/new finess app/` (entire folder)

**Important files to include**:
- `/backend/.env` (contains database and API keys)
- `/mobile/.env` (contains Supabase keys)
- All source code files

**Can exclude** (will be regenerated):
- `node_modules/` folders
- `dist/` folders
- `.next/` folder

## Setup on New Computer

### 1. Install Required Software:
- **Node.js** (v18+): https://nodejs.org/
- **Git**: https://git-scm.com/
- **VS Code**: https://code.visualstudio.com/
- **Android Studio**: https://developer.android.com/studio
- **WSL2** (Windows only): `wsl --install`

### 2. Install Dependencies:

```bash
# Backend dependencies
cd backend
npm install

# Mobile dependencies  
cd ../mobile
npm install

# Install Expo CLI globally
npm install -g expo-cli
```

### 3. Environment Setup:

Create/copy these `.env` files:

**`/backend/.env`**:
```
DATABASE_URL="postgresql://fitness_user:fitness_password@localhost:5432/korean_fitness_db?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19000
```

**`/mobile/.env`**:
```
# API Configuration
EXPO_PUBLIC_API_URL=http://172.28.204.132:3000/api

# Environment
EXPO_PUBLIC_ENV=development

# Supabase Configuration (Development)  
EXPO_PUBLIC_SUPABASE_URL=https://nwpyliujuimufkfjolsj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA
```

### 4. Database Setup:

```bash
# Generate Prisma client
cd backend
npx prisma generate

# Create/update database schema
npx prisma db push

# (Optional) Seed database
npm run seed
```

### 5. Start Development:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start mobile app
cd mobile
npx expo start --lan
```

## Project Structure

```
new finess app/
├── backend/          # Node.js backend with Prisma
│   ├── src/
│   ├── prisma/
│   └── .env         # Backend environment variables
├── mobile/          # React Native + Expo app
│   ├── src/
│   ├── assets/
│   └── .env         # Mobile environment variables
└── README.md
```

## Key Features Added Recently

1. **Test Account System**: Multiple login options on login screen
2. **Diagnostic Screen**: Connection troubleshooting tool
3. **Supabase Integration**: Exercise GIFs and authentication
4. **Offline Mode Handling**: Works without backend connection

## Troubleshooting

### If Supabase connection fails:
1. Check `.env` file has correct values
2. Clear Expo cache: `npx expo start --clear`
3. Use Diagnostic screen to test connection

### If backend won't start:
1. Make sure PostgreSQL is installed and running
2. Check DATABASE_URL in `.env`
3. Run `npx prisma db push` to create tables

## Important Accounts

- Test Account: `test@example.com` / `test123456`
- Your Account: `dannyboy0914@gmail.com` / [your password]

## Git Branches

- `cleanup-20250729`: Latest working branch with all fixes
- `main`: Main branch (may be behind)