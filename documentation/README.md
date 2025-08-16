# Fitness App Documentation

## Overview
Comprehensive documentation for a Korean-language fitness tracking application with social features, AI-powered programs, and detailed analytics.

## Documentation Structure

### 📄 [FEATURES.md](./FEATURES.md)
Complete list of all app features organized by the 5 main sections:
- **홈 (Home)**: Workout tracking, AI programs, quick actions
- **기록 (Records)**: Calendar, history, progress photos, metrics
- **통계 (Statistics)**: Analytics, muscle group visualization, trends
- **소셜 (Social)**: Community feed, social interactions
- **메뉴 (Menu)**: Settings, calculators, profile management

### 🗺️ [NAVIGATION_FLOW.md](./NAVIGATION_FLOW.md)
Detailed screen-to-screen navigation mapping:
- Primary bottom tab navigation
- Screen flow diagrams
- Modal and overlay patterns
- Deep linking structure
- Navigation state management

### 🗄️ [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
Complete database design with 20 interconnected tables:
- User-centric architecture
- Full SQL schemas with constraints
- Foreign key relationships
- Performance optimization indexes
- Data integrity rules

## Key Features

### Core Functionality
- **Workout Tracking**: Comprehensive exercise logging with sets, reps, weight
- **AI Programs**: FlickAI for personalized workout generation
- **Progress Monitoring**: Body metrics, photos, performance analytics
- **Social Features**: Community feed, follows, likes, comments
- **Gamification**: Tier system (Bronze to Challenger), achievements

### Technical Highlights
- Korean language support
- Responsive design for mobile
- Real-time rest timer with notifications
- Data visualization (charts, graphs, 3D models)
- Apple Health integration

## Database Architecture

The app uses a relational database with the **User** entity as the central hub:

```
User ─┬─> Workouts ──> Exercises ──> Sets
      ├─> Body Metrics
      ├─> Progress Photos
      ├─> Social Posts ──> Likes/Comments
      ├─> Follows (many-to-many)
      └─> Settings/Preferences
```

## Navigation Structure

```
Bottom Tab Bar:
[홈] [기록] [통계] [소셜] [메뉴]
 │     │      │      │      │
Home Records Stats Social Menu
```

Each section maintains its own navigation stack with contextual flows.

## Knowledge Graph

The app structure has been mapped into a knowledge graph showing:
- Application contains 5 main sections
- Sections interconnect through navigation and data sharing
- All features organically connected through the database

## User Tiers

1. **브론즈 (Bronze)** - Starting tier
2. **실버 (Silver)**
3. **골드 (Gold)**
4. **플래티넘 (Platinum)**
5. **다이아몬드 (Diamond)**
6. **챌린저 (Challenger)** - Highest tier

## Development Notes

- Language: Korean (with some English exercise names)
- Primary user shown: dan914 (Diamond tier)
- Pro subscription available (플릭 프로)
- Extensive settings for customization

## Future Enhancements

Consider adding:
- Offline mode support
- Multi-language support
- Video exercise demonstrations
- Nutrition tracking
- Coach/trainer features
- Workout plan marketplace

---

*Documentation created from 40+ app screenshots and comprehensive analysis of features, navigation, and database structure.*