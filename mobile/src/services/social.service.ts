import api from './api';
import { API_ENDPOINTS } from '../constants/api';
import { apiCall } from '../utils/apiWrapper';
import {
  SocialPost,
  PostComment,
  PostLike,
  UserFollow,
  Challenge,
  ChallengeParticipant,
  LeaderboardEntry,
  User,
  UserStats,
  SearchResult,
  NotificationItem,
} from '../types';

// Default data for offline mode
const defaultFeedData = { posts: [], hasMore: false };
const defaultChallenges: Challenge[] = [];
const defaultSearchResult: SearchResult = { users: [], posts: [], challenges: [] };

class SocialService {
  // Feed & Posts
  async getFeed(page: number = 1, limit: number = 10) {
    return apiCall(
      async () => {
        const response = await api.get<{ posts: SocialPost[]; hasMore: boolean }>(
          API_ENDPOINTS.SOCIAL.FEED,
          { page, limit }
        );
        return response.data;
      },
      defaultFeedData,
      { cacheKey: `@social_feed_${page}` }
    );
  }

  async createPost(content: string, imageUrl?: string, workoutId?: string) {
    const response = await api.post<SocialPost>(API_ENDPOINTS.SOCIAL.POSTS, {
      content,
      imageUrl,
      workoutId,
    });
    return response.data;
  }

  async getPost(postId: string) {
    const response = await api.get<SocialPost>(
      API_ENDPOINTS.SOCIAL.POST_BY_ID(postId)
    );
    return response.data;
  }

  async deletePost(postId: string) {
    await api.delete(API_ENDPOINTS.SOCIAL.POST_BY_ID(postId));
  }

  // Post Interactions
  async likePost(postId: string) {
    const response = await api.post<{ isLiked: boolean; likesCount: number }>(
      API_ENDPOINTS.SOCIAL.POST_LIKE(postId)
    );
    return response.data;
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 20) {
    const response = await api.get<{ comments: PostComment[]; hasMore: boolean }>(
      API_ENDPOINTS.SOCIAL.POST_COMMENTS(postId),
      { page, limit }
    );
    return response.data;
  }

  async addComment(postId: string, content: string) {
    const response = await api.post<PostComment>(
      API_ENDPOINTS.SOCIAL.POST_COMMENTS(postId),
      { content }
    );
    return response.data;
  }

  async deleteComment(postId: string, commentId: string) {
    await api.delete(`${API_ENDPOINTS.SOCIAL.POST_COMMENTS(postId)}/${commentId}`);
  }

  // Follow System
  async followUser(userId: string) {
    const response = await api.post<{ isFollowing: boolean }>(
      API_ENDPOINTS.SOCIAL.FOLLOW,
      { userId }
    );
    return response.data;
  }

  async unfollowUser(userId: string) {
    const response = await api.post<{ isFollowing: boolean }>(
      API_ENDPOINTS.SOCIAL.UNFOLLOW,
      { userId }
    );
    return response.data;
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const response = await api.get<{ followers: User[]; hasMore: boolean }>(
      API_ENDPOINTS.SOCIAL.FOLLOWERS(userId),
      { page, limit }
    );
    return response.data;
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const response = await api.get<{ following: User[]; hasMore: boolean }>(
      API_ENDPOINTS.SOCIAL.FOLLOWING(userId),
      { page, limit }
    );
    return response.data;
  }

  // User Discovery & Search
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const response = await api.get<{ users: User[]; hasMore: boolean }>(
      API_ENDPOINTS.USER.SEARCH,
      { q: query, page, limit }
    );
    return response.data;
  }

  async getUserProfile(userId: string) {
    const response = await api.get<User>(API_ENDPOINTS.USER.BY_ID(userId));
    return response.data;
  }

  async getUserStats(userId: string) {
    const response = await api.get<UserStats>(
      `${API_ENDPOINTS.USER.BY_ID(userId)}/stats`
    );
    return response.data;
  }

  async getSuggestedUsers(limit: number = 10) {
    const response = await api.get<User[]>('/social/suggested-users', { limit });
    return response.data;
  }

  // Global Search
  async globalSearch(query: string) {
    const response = await api.get<SearchResult>(
      API_ENDPOINTS.SOCIAL.SEARCH,
      { q: query }
    );
    return response.data;
  }

  // Challenges
  async getChallenges(
    type: 'active' | 'upcoming' | 'completed' = 'active',
    page: number = 1,
    limit: number = 10
  ) {
    const response = await api.get<{ challenges: Challenge[]; hasMore: boolean }>(
      API_ENDPOINTS.CHALLENGES.BASE,
      { type, page, limit }
    );
    return response.data;
  }

  async getChallenge(challengeId: string) {
    const response = await api.get<Challenge>(
      API_ENDPOINTS.CHALLENGES.BY_ID(challengeId)
    );
    return response.data;
  }

  async joinChallenge(challengeId: string) {
    const response = await api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.CHALLENGES.JOIN(challengeId)
    );
    return response.data;
  }

  async leaveChallenge(challengeId: string) {
    const response = await api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.CHALLENGES.LEAVE(challengeId)
    );
    return response.data;
  }

  async getChallengeLeaderboard(
    challengeId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const response = await api.get<{
      leaderboard: LeaderboardEntry[];
      userRank?: number;
      hasMore: boolean;
    }>(API_ENDPOINTS.CHALLENGES.LEADERBOARD(challengeId), { page, limit });
    return response.data;
  }

  async getUserChallenges(status: 'active' | 'completed' = 'active') {
    const response = await api.get<Challenge[]>(
      API_ENDPOINTS.CHALLENGES.USER_CHALLENGES,
      { status }
    );
    return response.data;
  }

  async updateChallengeProgress(challengeId: string, progress: number) {
    const response = await api.post<{ success: boolean; newProgress: number }>(
      `${API_ENDPOINTS.CHALLENGES.BY_ID(challengeId)}/progress`,
      { progress }
    );
    return response.data;
  }

  // Notifications
  async getNotifications(page: number = 1, limit: number = 20) {
    const response = await api.get<{
      notifications: NotificationItem[];
      hasMore: boolean;
      unreadCount: number;
    }>(API_ENDPOINTS.NOTIFICATIONS.BASE, { page, limit });
    return response.data;
  }

  async markNotificationRead(notificationId: string) {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
  }

  async markAllNotificationsRead() {
    await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }

  async getUnreadNotificationCount() {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  }

  // Activity Feed (combined user activities)
  async getUserActivityFeed(userId: string, page: number = 1, limit: number = 10) {
    const response = await api.get<{ activities: any[]; hasMore: boolean }>(
      `${API_ENDPOINTS.USER.BY_ID(userId)}/activity`,
      { page, limit }
    );
    return response.data;
  }

  // Trending & Discovery
  async getTrendingChallenges(limit: number = 5) {
    return apiCall(
      async () => {
        const response = await api.get<Challenge[]>('/challenges/trending', { limit });
        return response.data;
      },
      defaultChallenges,
      { cacheKey: '@social_trending_challenges' }
    );
  }

  async getTrendingPosts(limit: number = 10) {
    return apiCall(
      async () => {
        const response = await api.get<SocialPost[]>('/social/trending', { limit });
        return response.data;
      },
      [],
      { cacheKey: '@social_trending_posts' }
    );
  }

  async getPopularUsers(limit: number = 10) {
    return apiCall(
      async () => {
        const response = await api.get<User[]>('/social/popular-users', { limit });
        return response.data;
      },
      [],
      { cacheKey: '@social_popular_users' }
    );
  }
}

export default new SocialService();