# Configuration Guide

## Environment Variables

### Required
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Environment
EXPO_PUBLIC_ENV=development|production
```

### Optional
```bash
# Feature Flags
EXPO_PUBLIC_ENABLE_MOCK_AUTH=false
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_SOCIAL=false

# API Configuration
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_MAX_RETRY_ATTEMPTS=3
```

## App Configuration

### Navigation Settings
```typescript
// src/navigation/config.ts
export const NAVIGATION_CONFIG = {
  SKIP_LOGIN: false,  // Bypass auth for testing
  ENABLE_MOCK_AUTH: false,  // Use mock authentication
  DEFAULT_ROUTE: 'HomeScreen',
  AUTH_REDIRECT: 'LoginScreen',
};
```

### Storage Configuration
```typescript
// src/config/storage.ts
export const STORAGE_CONFIG = {
  // AsyncStorage Keys
  KEYS: {
    AUTH_TOKEN: '@auth_token',
    USER_DATA: '@user_data',
    WORKOUTS: '@workouts',
    ROUTINES: '@routines',
    SETTINGS: '@settings',
    SYNC_QUEUE: '@sync_queue',
  },
  
  // Storage Limits
  LIMITS: {
    MAX_WORKOUTS: 1000,
    MAX_PHOTOS: 100,
    CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Sync Settings
  SYNC: {
    INTERVAL: 5 * 60 * 1000, // 5 minutes
    MAX_RETRY: 3,
    BATCH_SIZE: 10,
  },
};
```

### Exercise Database Configuration
```typescript
// src/config/exercises.ts
export const EXERCISE_CONFIG = {
  // Categories
  CATEGORIES: [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'legs', 'glutes', 'abs', 'calves', 'forearms',
    'cardio', 'full_body', 'stretching', 'olympic', 'other'
  ],
  
  // Equipment Types
  EQUIPMENT: [
    'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight',
    'kettlebell', 'band', 'medicine_ball', 'foam_roller', 'other'
  ],
  
  // Volume Adjustments
  VOLUME_MULTIPLIERS: {
    DUMBBELL: 2,  // Count both dumbbells
    UNILATERAL: 2,  // Count both sides
    CABLE: 1,
    BARBELL: 1,
    MACHINE: 1,
  },
};
```

### Workout Settings
```typescript
// src/config/workout.ts
export const WORKOUT_CONFIG = {
  // Timer Settings
  REST_TIMER: {
    DEFAULT_SECONDS: 90,
    MIN_SECONDS: 30,
    MAX_SECONDS: 300,
    AUTO_START: false,
  },
  
  // Set Configuration
  SETS: {
    DEFAULT_REPS: 10,
    DEFAULT_SETS: 3,
    MAX_SETS: 10,
    WARM_UP_PERCENTAGE: 0.5,
  },
  
  // Progression
  PROGRESSION: {
    WEIGHT_INCREMENT_KG: 2.5,
    WEIGHT_INCREMENT_LB: 5,
    REP_INCREMENT: 1,
    AUTO_PROGRESS: true,
  },
};
```

### UI Configuration
```typescript
// src/config/ui.ts
export const UI_CONFIG = {
  // Theme
  THEME: {
    DEFAULT: 'light',
    AVAILABLE: ['light', 'dark', 'auto'],
  },
  
  // Animations
  ANIMATIONS: {
    ENABLED: true,
    DURATION: 300,
    EASING: 'ease-in-out',
  },
  
  // Charts
  CHARTS: {
    DEFAULT_PERIOD: 30, // days
    MAX_DATA_POINTS: 100,
    COLORS: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
  },
  
  // Lists
  LISTS: {
    PAGE_SIZE: 20,
    INITIAL_LOAD: 10,
    VIRTUALIZATION_THRESHOLD: 50,
  },
};
```

### Network Configuration
```typescript
// src/config/network.ts
export const NETWORK_CONFIG = {
  // API Settings
  API: {
    BASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // Offline Behavior
  OFFLINE: {
    ENABLE_QUEUE: true,
    MAX_QUEUE_SIZE: 100,
    SYNC_ON_RECONNECT: true,
  },
  
  // Caching
  CACHE: {
    ENABLE: true,
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
  },
};
```

### Notification Configuration
```typescript
// src/config/notifications.ts
export const NOTIFICATION_CONFIG = {
  // Channels
  CHANNELS: {
    WORKOUT_REMINDER: {
      id: 'workout-reminder',
      name: 'Workout Reminders',
      importance: 4,
      vibrate: true,
    },
    ACHIEVEMENT: {
      id: 'achievement',
      name: 'Achievements',
      importance: 3,
      vibrate: false,
    },
  },
  
  // Default Settings
  DEFAULTS: {
    WORKOUT_REMINDER_TIME: '08:00',
    REST_TIMER_SOUND: true,
    ACHIEVEMENT_ALERTS: true,
  },
};
```

## Build Configuration

### Expo Configuration (app.json)
```json
{
  "expo": {
    "name": "Fitness App",
    "slug": "fitness-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.fitnessapp",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.fitnessapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"],
  "extends": "expo/tsconfig.base"
}
```

## Performance Configuration

### Metro Configuration (metro.config.js)
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for production
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Asset optimization
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db', 'mp3', 'ttf'],
};

module.exports = config;
```

### Babel Configuration (babel.config.js)
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
          },
        },
      ],
    ],
  };
};
```

## Security Configuration

### API Security
```typescript
// src/config/security.ts
export const SECURITY_CONFIG = {
  // Authentication
  AUTH: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    BIOMETRIC_ENABLED: false,
  },
  
  // Data Protection
  DATA: {
    ENCRYPT_STORAGE: true,
    CLEAR_ON_LOGOUT: true,
    SECURE_STORE_KEYS: ['auth_token', 'refresh_token'],
  },
  
  // Network Security
  NETWORK: {
    CERTIFICATE_PINNING: false,
    FORCE_HTTPS: true,
    VALIDATE_SSL: true,
  },
};
```

## Feature Flags

### Feature Toggle Configuration
```typescript
// src/config/features.ts
export const FEATURE_FLAGS = {
  // Core Features
  AUTHENTICATION: true,
  OFFLINE_MODE: true,
  WORKOUT_SYNC: true,
  
  // UI Features
  DARK_MODE: true,
  ANIMATIONS: true,
  HAPTIC_FEEDBACK: true,
  
  // Social Features
  SOCIAL_FEED: false,
  ACHIEVEMENTS: true,
  LEADERBOARDS: false,
  
  // Advanced Features
  AI_RECOMMENDATIONS: false,
  VOICE_COMMANDS: false,
  WEARABLE_SYNC: false,
  
  // Analytics
  CRASH_REPORTING: true,
  USAGE_ANALYTICS: true,
  PERFORMANCE_MONITORING: true,
};
```

## Development vs Production

### Environment-Specific Settings
```typescript
// src/config/env.ts
const isDev = process.env.EXPO_PUBLIC_ENV === 'development';

export const ENV_CONFIG = {
  // Logging
  LOG_LEVEL: isDev ? 'debug' : 'error',
  CONSOLE_LOGS: isDev,
  
  // API
  API_URL: isDev 
    ? 'http://localhost:3000' 
    : process.env.EXPO_PUBLIC_SUPABASE_URL,
  
  // Features
  MOCK_DATA: isDev,
  HOT_RELOAD: isDev,
  
  // Performance
  PROFILING: isDev,
  REACT_DEVTOOLS: isDev,
};
```