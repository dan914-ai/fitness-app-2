// API Configuration
export const API_CONFIG = {
  // Default to localhost for development
  // In production, this should be replaced with your actual API URL
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    
    // User
    USER: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
    },
    
    // Workouts
    WORKOUTS: {
      BASE: '/workouts',
      SESSION: {
        START: '/workouts/session/start',
        END: '/workouts/session/:workoutId/end',
        ACTIVE: '/workouts/session/active',
        ADD_EXERCISE: '/workouts/session/:workoutId/exercise',
        REMOVE_EXERCISE: '/workouts/session/:workoutId/exercise/:workoutExerciseId',
        UPDATE_SETS: '/workouts/session/exercise/:workoutExerciseId/sets',
      },
    },
    
    // Exercises
    EXERCISES: {
      BASE: '/exercises',
      BY_ID: '/exercises/:exerciseId',
      SEARCH: '/exercises/search',
    },
    
    // Social
    SOCIAL: {
      FEED: '/social/feed',
      POSTS: '/social/posts',
      POST_BY_ID: '/social/posts/:postId',
      LIKE: '/social/posts/:postId/like',
      COMMENTS: '/social/posts/:postId/comments',
      FOLLOW: '/social/follow',
      UNFOLLOW: '/social/unfollow',
    },
    
    // Challenges
    CHALLENGES: {
      BASE: '/challenges',
      TRENDING: '/challenges/trending',
      USER: '/challenges/user',
      BY_ID: '/challenges/:challengeId',
      JOIN: '/challenges/:challengeId/join',
      LEAVE: '/challenges/:challengeId/leave',
      UPDATE_PROGRESS: '/challenges/:challengeId/progress',
      LEADERBOARD: '/challenges/:challengeId/leaderboard',
    },
    
    // Analytics
    ANALYTICS: {
      WORKOUT_ANALYTICS: '/analytics/workout-analytics',
      STRENGTH_PROGRESS: '/analytics/strength-progress',
      BODY_MEASUREMENTS: '/analytics/body-measurements',
      PROGRESS_PHOTOS: '/analytics/progress-photos',
      ACHIEVEMENTS: '/analytics/achievements',
      OVERALL_STATS: '/analytics/overall-stats',
    },

    // Achievements
    ACHIEVEMENTS: {
      LIST: '/achievements',
      BY_CATEGORY: '/achievements/category/:category',
      USER: '/achievements/user/:userId',
      PROCESS_EVENT: '/achievements/user/:userId/process-event',
      USER_STATS: '/achievements/user/:userId/stats',
      UNLOCK: '/achievements/user/:userId/unlock',
      NOTIFICATIONS: '/achievements/user/:userId/notifications',
      MARK_SEEN: '/achievements/user/:userId/notifications/mark-seen',
    },
  },
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
  },
};

// Helper function to build URL with params
export function buildUrl(endpoint: string, params?: Record<string, string>): string {
  let url = endpoint;
  
  // Replace path parameters
  if (params) {
    Object.keys(params).forEach(key => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, params[key]);
        delete params[key];
      }
    });
  }
  
  return url;
}