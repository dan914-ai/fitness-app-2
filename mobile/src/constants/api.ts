export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const API_URL = API_BASE_URL;

// Socket.IO endpoints for real-time features
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  NEW_POST: 'new_post',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
  USER_FOLLOWED: 'user_followed',
  CHALLENGE_JOINED: 'challenge_joined',
  NOTIFICATION: 'notification',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    SEARCH: '/users/search',
    BY_ID: (id: string) => `/users/${id}`,
  },
  WORKOUTS: {
    BASE: '/workouts',
    BY_ID: (id: string) => `/workouts/${id}`,
  },
  EXERCISES: {
    BASE: '/exercises',
    SEARCH: '/exercises/search',
    BY_ID: (id: string) => `/exercises/${id}`,
  },
  SOCIAL: {
    FEED: '/social/feed',
    POSTS: '/social/posts',
    POST_BY_ID: (id: string) => `/social/posts/${id}`,
    POST_LIKE: (id: string) => `/social/posts/${id}/like`,
    POST_COMMENTS: (id: string) => `/social/posts/${id}/comments`,
    FOLLOW: '/social/follow',
    UNFOLLOW: '/social/unfollow',
    FOLLOWERS: (userId: string) => `/social/users/${userId}/followers`,
    FOLLOWING: (userId: string) => `/social/users/${userId}/following`,
    SEARCH: '/social/search',
  },
  CHALLENGES: {
    BASE: '/challenges',
    BY_ID: (id: string) => `/challenges/${id}`,
    JOIN: (id: string) => `/challenges/${id}/join`,
    LEAVE: (id: string) => `/challenges/${id}/leave`,
    LEADERBOARD: (id: string) => `/challenges/${id}/leaderboard`,
    USER_CHALLENGES: '/challenges/user',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};