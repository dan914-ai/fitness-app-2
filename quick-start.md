# Quick Start Guide

## Current Setup Status
✅ Backend dependencies installed
✅ Mobile dependencies installed  
✅ Database migrations ready
✅ Environment variables configured
⏸️ Docker needs to be started

## Steps to Run the App

### 1. Start Docker Database
**Option A: Use the provided script**
```batch
# From Windows Command Prompt or PowerShell
start-docker-db.bat
```

**Option B: Manual steps**
1. Make sure Docker Desktop is running
2. Open Command Prompt/PowerShell and run:
```batch
docker run --name fitness-db -e POSTGRES_USER=fitness_user -e POSTGRES_PASSWORD=fitness_password -e POSTGRES_DB=korean_fitness_db -p 5432:5432 -d postgres:14
```

### 2. Start Backend Server
Open a terminal in VSCode or WSL:
```bash
cd "/mnt/c/Users/PW1234/.vscode/new finess app/backend"
npm run dev
```

The backend should start on http://localhost:3000

### 3. Start Mobile App
Open another terminal:
```bash
cd "/mnt/c/Users/PW1234/.vscode/new finess app/mobile"
npx expo start -c
```

Press:
- `w` to open in web browser
- `a` to open in Android emulator
- Scan QR code with Expo Go app on your phone

## Testing the App
- **Test Account**: The app has a "테스트 계정 생성" (Create Test Account) button on the login screen
- **Backend Health Check**: http://localhost:3000/api/health
- **Mobile runs offline**: The app works even without the backend running

## Troubleshooting

### Docker Issues
- Make sure Docker Desktop is running
- Enable WSL 2 integration in Docker Desktop settings
- Restart Docker Desktop if needed

### Backend Can't Connect to Database
- Check if container is running: `docker ps`
- Check logs: `docker logs fitness-db`
- Restart container: `docker restart fitness-db`

### Mobile App Can't Connect to Backend
For physical device testing:
1. Find your computer's IP: `ipconfig` (look for IPv4 address)
2. Update mobile/.env with your IP:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api
   ```
3. Restart Expo with: `npx expo start -c`