# Setup Guide for New Computer

## Prerequisites Status
✅ **Node.js**: v22.18.0 installed
✅ **npm**: v11.5.2 installed
❌ **Docker**: Not installed (needed for PostgreSQL database)

## Step-by-Step Setup

### 1. Install Docker (for Database)

Since Docker is not installed, you have two options:

#### Option A: Install Docker Desktop (Recommended)
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Verify installation: `docker --version`

#### Option B: Use Supabase (Alternative)
Since your project already uses Supabase for storage, you can use Supabase for the database too:
1. Go to https://supabase.com
2. Create a free project
3. Update the DATABASE_URL in backend/.env with Supabase connection string

### 2. Install Backend Dependencies

```bash
cd "/mnt/c/Users/PW1234/.vscode/new finess app/backend"
npm install
```

### 3. Set up Database

#### If using Docker:
```bash
# Start PostgreSQL container
docker run --name fitness-db \
  -e POSTGRES_USER=fitness_user \
  -e POSTGRES_PASSWORD=fitness_password \
  -e POSTGRES_DB=korean_fitness_db \
  -p 5432:5432 \
  -d postgres:14

# Wait 10 seconds for database to start
sleep 10

# Run database migrations
cd backend
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

#### If using Supabase:
1. Update backend/.env with Supabase DATABASE_URL
2. Run migrations:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### 4. Install Mobile App Dependencies

```bash
cd "/mnt/c/Users/PW1234/.vscode/new finess app/mobile"
npm install

# Install Expo CLI globally (if not installed)
npm install -g expo-cli
```

### 5. Configure Environment Variables

The mobile app needs to know where the backend API is:

```bash
# Check your IP address (for physical device testing)
ipconfig
# Look for IPv4 Address under your active network adapter

# Update mobile/.env if needed
echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > mobile/.env
```

### 6. Start the Application

#### Terminal 1 - Backend:
```bash
cd "/mnt/c/Users/PW1234/.vscode/new finess app/backend"
npm run dev
```

#### Terminal 2 - Mobile:
```bash
cd "/mnt/c/Users/PW1234/.vscode/new finess app/mobile"
npx expo start -c
```

## Quick Start Scripts

### Windows PowerShell:
Save this as `start-app.ps1`:
```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\PW1234\.vscode\new finess app\backend'; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Mobile
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\PW1234\.vscode\new finess app\mobile'; npx expo start"
```

### Batch File (already exists):
Use the existing `start-app.bat` file in the project root.

## Verification Checklist

- [ ] Node.js installed (✅ Done)
- [ ] Docker installed or Supabase configured
- [ ] Backend dependencies installed
- [ ] Database running and seeded
- [ ] Mobile dependencies installed
- [ ] Backend server running on port 3000
- [ ] Mobile app running with Expo
- [ ] Can access app in browser/device

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running on port 5432
- Check DATABASE_URL in backend/.env
- Try: `npx prisma studio` to verify database connection

### Mobile App Can't Connect to Backend
- Check firewall settings
- Use computer's IP instead of localhost
- Verify backend is running on port 3000

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Next Steps After Setup
1. Test user login with: test@example.com
2. Try creating a workout session
3. Test offline mode by stopping the backend
4. Review pending features in README-CURRENT-STATUS.md