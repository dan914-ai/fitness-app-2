# Korean Fitness Tracking App

A comprehensive fitness tracking application inspired by Korean fitness apps, featuring workout tracking, social challenges, progress analytics, and a gamified tier system.

## 🏋️ Project Overview

This fitness app is designed based on analysis of 40+ screenshots from a popular Korean fitness application. It includes:
- **Workout Tracking**: Detailed exercise logging with sets, reps, and weights
- **Social Features**: Follow users, share workouts, participate in challenges
- **Tier System**: Gamification from 브론즈 (Bronze) to 챌린저 (Challenger)
- **Progress Analytics**: Body measurements, photos, and performance tracking
- **Diet Logging**: Track nutrition and calories

## 📁 Project Structure

```
korean-fitness-app/
├── backend/               # Express.js + TypeScript API
│   ├── src/              # Source code
│   ├── prisma/           # Database schema and migrations
│   └── README.md         # Backend documentation
├── documentation/        # Complete app analysis and design docs
│   ├── FEATURES.md      # Feature catalog
│   ├── DATABASE_SCHEMA.md # Database design
│   ├── API_DOCUMENTATION.md # API endpoints
│   └── ...
├── mcp-servers/          # Custom MCP servers
│   ├── taskmaster/      # Task management
│   └── context7/        # Context management
└── docker-compose.yml    # PostgreSQL database setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- Git

### Backend Setup

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL with your credentials
   ```

4. **Run migrations**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Express validators

### Frontend (Planned)
- **Mobile**: React Native + Expo
- **State Management**: Redux Toolkit
- **UI Components**: React Native Elements

## 📚 Documentation

- [Features Overview](documentation/FEATURES.md)
- [Database Schema](documentation/DATABASE_SCHEMA.md)
- [API Documentation](documentation/API_DOCUMENTATION.md)
- [UI/UX Improvements](documentation/UI_UX_IMPROVEMENTS.md)
- [Deployment Guide](documentation/DEPLOYMENT_GUIDE.md)

## 🔧 MCP Servers

This project includes custom MCP servers for enhanced development:

### Standard MCP Servers
- **filesystem** - File system access
- **memory** - Persistent memory storage
- **github** - GitHub integration
- **sequential-thinking** - Step-by-step reasoning
- **puppeteer** - Browser automation

### Custom MCP Servers
- **taskmaster** - Advanced task management
- **context7** - Context management with versioning

To build custom servers:
```bash
cd mcp-servers/taskmaster && npm install && npm run build
cd ../context7 && npm install && npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.