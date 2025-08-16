# Running the Korean Fitness App

## Prerequisites

1. **Docker Desktop** (for PostgreSQL database)
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running before starting the app

2. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/

3. **Expo CLI** (for mobile development)
   ```bash
   npm install -g expo-cli
   ```

## Quick Start (Windows)

Simply double-click the `start-app.bat` file in the project root directory. This will:
1. Start the PostgreSQL database
2. Run database migrations
3. Start the backend server
4. Start the mobile app with Expo

## Manual Setup

### 1. Start the Database

```bash
# Using Docker Compose
docker-compose up -d postgres

# Or run PostgreSQL locally and update the connection string in backend/.env
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npx prisma db seed

# Start the backend server
npm run dev
```

The backend will run on: http://localhost:3000

### 3. Setup Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start
```

This will open Expo Developer Tools in your browser. You can then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your phone

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://fitness_user:fitness_password@localhost:5432/korean_fitness_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

### Mobile (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**Note**: If testing on a physical device, replace `localhost` with your computer's IP address.

## Troubleshooting

### Database Connection Issues
- Make sure Docker Desktop is running
- Check if PostgreSQL container is running: `docker ps`
- Verify database credentials in `backend/.env`

### Mobile App Can't Connect to Backend
- If using a physical device, update `EXPO_PUBLIC_API_URL` in `mobile/.env` to use your computer's IP address
- Make sure your phone and computer are on the same network
- Check firewall settings

### Port Already in Use
- Backend (3000): Change `PORT` in `backend/.env`
- Database (5432): Update port in `docker-compose.yml` and `backend/.env`

## Stopping the Application

1. Close the terminal windows running the backend and mobile app
2. Stop the database:
   ```bash
   docker-compose down
   ```

## Features Overview

- **User Authentication**: Register/login with JWT tokens
- **Workout Tracking**: Real-time exercise tracking with sets, reps, and weights
- **Exercise Library**: Browse and search exercises with muscle group visualization
- **Social Features**: Share workouts, follow users, like and comment on posts
- **Challenges**: Join fitness challenges and compete on leaderboards
- **Analytics**: Track progress with charts and statistics
- **Achievements**: Earn badges for reaching fitness milestones