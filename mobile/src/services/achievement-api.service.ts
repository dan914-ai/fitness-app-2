import { API_CONFIG, buildUrl } from '../config/api';
import { makeRequest } from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementNotification } from '../types/achievements';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

export interface Achievement {
  id: string;
  category: string;
  rarity: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  icon: string;
  goal: {
    metric: string;
    target: number;
    comparator: string;
  };
  triggers: string[];
  filters: any;
  rewards: {
    xp: number;
    points: number;
    badges?: string[];
  };
  repeatable: boolean;
  repeat_cooldown_days?: number;
  window_scope: string;
  active: boolean;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  progressTarget: number;
  isCompleted: boolean;
  repeatCount: number;
  lastRepeatAt?: string;
  nextAvailableAt?: string;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  xpEarned: number;
  pointsEarned: number;
  completionRate: number;
  categoryBreakdown: {
    [category: string]: {
      unlocked: number;
      total: number;
    };
  };
  recentUnlocks: UserAchievement[];
}

class AchievementApiService {
  private async getUserId(): Promise<string> {
    const user = await AsyncStorage.getItem('user');
    if (!user) throw new Error('User not found');
    const userData = safeJsonParse(user, {});
    return userData.id || userData.userId || 'test-user-123';
  }

  // Get all achievements
  async getAllAchievements(): Promise<{ achievements: Achievement[]; total: number }> {
    const url = API_CONFIG.ENDPOINTS.ACHIEVEMENTS.LIST;
    const response = await makeRequest('GET', url);
    return response.data;
  }

  // Get achievements by category
  async getAchievementsByCategory(category: string): Promise<{ achievements: Achievement[]; category: string; total: number }> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.BY_CATEGORY, { category });
    const response = await makeRequest('GET', url);
    return response.data;
  }

  // Get user's unlocked achievements
  async getUserAchievements(): Promise<{ userAchievements: UserAchievement[]; userId: number; total: number }> {
    const userId = await this.getUserId();
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.USER, { userId });
    const response = await makeRequest('GET', url);
    return response.data;
  }

  // Process achievement event
  async processAchievementEvent(eventType: string, eventData: any): Promise<{ notifications: AchievementNotification[]; processed: boolean; eventType: string; userId: number }> {
    const userId = await this.getUserId();
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.PROCESS_EVENT, { userId });
    const response = await makeRequest('POST', url, { eventType, eventData });
    return response.data;
  }

  // Get achievement statistics
  async getAchievementStats(): Promise<AchievementStats> {
    const userId = await this.getUserId();
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.USER_STATS, { userId });
    const response = await makeRequest('GET', url);
    return response.data;
  }

  // Manually unlock achievement (for testing)
  async unlockAchievement(achievementId: string): Promise<{ unlocked: boolean; achievement: Achievement; userId: number; unlockedAt: string }> {
    const userId = await this.getUserId();
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.UNLOCK, { userId });
    const response = await makeRequest('POST', url, { achievementId });
    return response.data;
  }

  // Get unseen achievement notifications
  async getNotifications(): Promise<{ notifications: AchievementNotification[]; count: number; userId: number }> {
    const userId = await this.getUserId();
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.NOTIFICATIONS, { userId });
    const response = await makeRequest('GET', url);
    return response.data;
  }

  // Mark notifications as seen
  async markNotificationsAsSeen(notificationIds: string[]): Promise<{ marked: number; userId: number }> {
    const userId = await this.getUserId();
    const url = buildUrl(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.MARK_SEEN, { userId });
    const response = await makeRequest('PUT', url, { notificationIds });
    return response.data;
  }
}

export default new AchievementApiService();