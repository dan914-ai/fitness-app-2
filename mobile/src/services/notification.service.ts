import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

// Only import notifications if not in Expo Go to avoid SDK 53 warnings
const isExpoGo = Constants.appOwnership === 'expo';
let Notifications: any = {};

if (!isExpoGo && Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  
  // Configure notifications behavior only for native platforms
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} else {
  // Create dummy functions for Expo Go
  Notifications.setNotificationChannelAsync = async () => {};
  Notifications.getPermissionsAsync = async () => ({ status: 'denied' });
  Notifications.requestPermissionsAsync = async () => ({ status: 'denied' });
  Notifications.getExpoPushTokenAsync = async () => ({ data: null });
  Notifications.scheduleNotificationAsync = async () => {};
  Notifications.getAllScheduledNotificationsAsync = async () => [];
  Notifications.cancelScheduledNotificationAsync = async () => {};
  Notifications.cancelAllScheduledNotificationsAsync = async () => {};
  Notifications.addNotificationReceivedListener = () => {};
  Notifications.addNotificationResponseReceivedListener = () => {};
  Notifications.AndroidImportance = { MAX: 5 };
}

export interface NotificationSettings {
  workoutReminders: boolean;
  socialNotifications: boolean;
  challengeUpdates: boolean;
  achievementNotifications: boolean;
  workoutRemindersTime: string;
  workoutRemindersFrequency: 'daily' | 'weekly' | 'custom';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private isWebPlatform: boolean = Platform.OS === 'web';

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // Skip initialization on web platform and Expo Go
      if (this.isWebPlatform || Constants.appOwnership === 'expo') {
        return;
      }

      // Request permissions
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.expoPushToken = token;
        await this.saveTokenToStorage(token);
        // Send token to backend
        await this.sendTokenToBackend(token);
      }

      // Schedule default workout reminders
      await this.setupDefaultNotifications();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // Register for push notifications
  private async registerForPushNotificationsAsync(): Promise<string | null> {
    // Skip on web platform
    if (this.isWebPlatform) {
      return null;
    }

    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? 
                          Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        console.error('Error getting push token:', e);
        return null;
      }
    } else {
    }

    return token;
  }

  // Save token to local storage
  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expoPushToken', token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  // Send token to backend
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // This would send the token to your backend API
      // await api.post('/users/push-token', { token });
    } catch (error) {
      console.error('Failed to send token to backend:', error);
    }
  }

  // Setup default notifications
  private async setupDefaultNotifications(): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      if (settings.workoutReminders) {
        await this.scheduleWorkoutReminders(settings);
      }
    } catch (error) {
      console.error('Failed to setup default notifications:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        return JSON.parse(settings);
      }
    } catch (error) {
      console.error('Failed to get notification settings:', error);
    }

    // Default settings
    return {
      workoutReminders: true,
      socialNotifications: true,
      challengeUpdates: true,
      achievementNotifications: true,
      workoutRemindersTime: '18:00',
      workoutRemindersFrequency: 'daily',
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }

  // Update notification settings
  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', safeJsonStringify(settings));
      
      // Cancel existing notifications
      await this.cancelAllWorkoutReminders();
      
      // Reschedule if enabled
      if (settings.workoutReminders) {
        await this.scheduleWorkoutReminders(settings);
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  // Schedule workout reminders
  async scheduleWorkoutReminders(settings: NotificationSettings): Promise<void> {
    try {
      // Skip on web platform and Expo Go
      if (this.isWebPlatform || Constants.appOwnership === 'expo') {
        return;
      }

      await this.cancelAllWorkoutReminders();

      const [hours, minutes] = settings.workoutRemindersTime.split(':').map(Number);
      
      if (settings.workoutRemindersFrequency === 'daily') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '운동 시간이에요! 💪',
            body: '오늘의 운동을 시작해보세요. 건강한 하루를 만들어가요!',
            data: { type: 'workout_reminder' },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 60 * 60 * 24, // 24 hours
            repeats: true,
          },
        });
      } else if (settings.workoutRemindersFrequency === 'weekly') {
        // For Expo Go, use time interval instead of calendar trigger
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '운동 시간이에요! 💪',
            body: '주간 운동 일정입니다. 꾸준히 운동해보세요!',
            data: { type: 'workout_reminder' },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: {
            type: 'timeInterval',
            seconds: 60 * 60 * 24 * 7, // 7 days
            repeats: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to schedule workout reminders:', error);
    }
  }

  // Cancel all workout reminders
  async cancelAllWorkoutReminders(): Promise<void> {
    try {
      // Skip on web platform
      if (this.isWebPlatform) {
        return;
      }

      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const workoutNotifications = notifications.filter(
        notification => notification.content.data?.type === 'workout_reminder'
      );
      
      for (const notification of workoutNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel workout reminders:', error);
    }
  }

  // Send immediate notification (for testing)
  async sendTestNotification(): Promise<void> {
    try {
      // Skip on web platform
      if (this.isWebPlatform) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '테스트 알림',
          body: '알림이 정상적으로 작동합니다!',
          data: { type: 'test' },
        },
        trigger: { type: 'timeInterval', seconds: 1 },
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  // Send social notification
  async sendSocialNotification(type: 'like' | 'comment' | 'follow' | 'challenge', data: any): Promise<void> {
    try {
      // Skip on web platform
      if (this.isWebPlatform) {
        return;
      }

      const settings = await this.getNotificationSettings();
      
      if (!settings.socialNotifications && type !== 'challenge') return;
      if (!settings.challengeUpdates && type === 'challenge') return;

      let title = '';
      let body = '';

      switch (type) {
        case 'like':
          title = '새로운 좋아요 👍';
          body = `${data.userName}님이 회원님의 게시물을 좋아합니다.`;
          break;
        case 'comment':
          title = '새로운 댓글 💬';
          body = `${data.userName}님이 댓글을 남겼습니다.`;
          break;
        case 'follow':
          title = '새로운 팔로워 👥';
          body = `${data.userName}님이 회원님을 팔로우하기 시작했습니다.`;
          break;
        case 'challenge':
          title = '챌린지 업데이트 🏆';
          body = data.message;
          break;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'social', subType: type, ...data },
          sound: settings.soundEnabled ? 'default' : undefined,
        },
        trigger: { type: 'timeInterval', seconds: 1 },
      });
    } catch (error) {
      console.error('Failed to send social notification:', error);
    }
  }

  // Send achievement notification
  async sendAchievementNotification(achievement: { name: string; description: string }): Promise<void> {
    try {
      // Skip on web platform
      if (this.isWebPlatform) {
        return;
      }

      const settings = await this.getNotificationSettings();
      if (!settings.achievementNotifications) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '새로운 업적 달성! 🎉',
          body: `"${achievement.name}" 업적을 달성했습니다!`,
          data: { type: 'achievement', ...achievement },
          sound: settings.soundEnabled ? 'default' : undefined,
        },
        trigger: { type: 'timeInterval', seconds: 1 },
      });
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      // Skip on web platform
      if (this.isWebPlatform) {
        return [];
      }

      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      // Skip on web platform
      if (this.isWebPlatform) {
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Add notification listeners
  addNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Skip on web platform
    if (this.isWebPlatform) {
      return;
    }

    if (onNotificationReceived) {
      Notifications.addNotificationReceivedListener(onNotificationReceived);
    }

    if (onNotificationResponse) {
      Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();