import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  AchievementStats,
  AchievementCategory,
  EventType,
  AchievementNotification
} from '../types/achievements';
// import achievementsData from '../data/achievements.json';
// Note: Import achievements.json dynamically to avoid TypeScript compilation issues
import { WorkoutHistoryItem } from '../utils/workoutHistory';
import achievementApiService from './achievement-api.service';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

const STORAGE_KEYS = {
  USER_ACHIEVEMENTS: '@user_achievements',
  ACHIEVEMENT_PROGRESS: '@achievement_progress',
  ACHIEVEMENT_NOTIFICATIONS: '@achievement_notifications',
  ACHIEVEMENT_STATS: '@achievement_stats',
};

class AchievementService {
  private achievements: Achievement[] = [];
  private userAchievements: Map<string, UserAchievement> = new Map();
  private progressCache: Map<string, AchievementProgress> = new Map();
  private notifications: AchievementNotification[] = [];
  private useBackendApi: boolean = true; // Try backend first, fallback to local

  constructor() {
    console.log('🚀 AchievementService constructor called');
    this.initializeService();
  }

  private async initializeService() {
    await this.loadAchievements();
    await this.loadUserProgress();
  }

  // Check if backend API is available
  private async isBackendAvailable(): Promise<boolean> {
    if (!this.useBackendApi) return false;
    
    try {
      await achievementApiService.getAllAchievements();
      return true;
    } catch (error) {
      console.warn('🔄 Backend API not available, using local storage:', error);
      return false;
    }
  }

  // Initialize achievements from JSON data
  private async loadAchievements() {
    try {
      console.log('📥 Loading achievements from JSON...');
      
      // Dynamic import to avoid TypeScript compilation issues
      const achievementsData = require('../data/achievements.json');
      console.log('Raw achievementsData:', achievementsData);
      
      if (!achievementsData || !achievementsData.achievements) {
        console.error('❌ No achievements data found!');
        this.achievements = [];
        return;
      }
      
      this.achievements = achievementsData.achievements as Achievement[];
      console.log(`📊 Loaded ${this.achievements.length} achievements`);
      console.log('First achievement:', this.achievements[0]);
    } catch (error) {
      console.error('❌ Error loading achievements data:', error);
      this.achievements = [];
    }
  }

  // Load user's achievement progress from storage
  private async loadUserProgress() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS);
      if (stored) {
        const achievements = safeJsonParse(stored, {}) as UserAchievement[];
        achievements.forEach(ua => this.userAchievements.set(ua.achievementId, ua));
      }

      const notifications = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_NOTIFICATIONS);
      if (notifications) {
        this.notifications = JSON.parse(notifications);
      }
    } catch (error) {
      console.error('Error loading user achievements:', error);
    }
  }

  // Save user achievements to storage
  private async saveUserProgress() {
    try {
      const achievements = Array.from(this.userAchievements.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENT_NOTIFICATIONS,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error('Error saving user achievements:', error);
    }
  }

  // Get all achievements
  getAllAchievements(): Achievement[] {
    return this.achievements.filter(a => a.active);
  }

  // Get achievements by category
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(
      a => a.active && a.category === category
    );
  }

  // Get user's unlocked achievements
  getUserAchievements(): UserAchievement[] {
    return Array.from(this.userAchievements.values());
  }

  // Get achievement by ID
  getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id);
  }

  // Check if achievement is unlocked
  isAchievementUnlocked(achievementId: string): boolean {
    const userAchievement = this.userAchievements.get(achievementId);
    return userAchievement?.isCompleted || false;
  }

  // Get achievement progress
  getAchievementProgress(achievementId: string): AchievementProgress | null {
    return this.progressCache.get(achievementId) || null;
  }

  // Process workout completion for achievements
  async processWorkoutCompletion(workout: WorkoutHistoryItem): Promise<AchievementNotification[]> {
    console.log('🔄 processWorkoutCompletion called with workout:', workout);
    const newUnlocks: AchievementNotification[] = [];
    
    // Check if achievements are loaded
    console.log(`📚 Total achievements loaded: ${this.achievements.length}`);
    
    // Check achievements triggered by workout.logged event
    const workoutAchievements = this.achievements.filter(
      a => a.active && a.triggers.includes('workout.logged')
    );
    
    console.log(`🎯 Found ${workoutAchievements.length} workout-triggered achievements to check`);

    for (const achievement of workoutAchievements) {
      const progress = await this.checkAchievementProgress(achievement, workout);
      console.log(`📈 Achievement "${achievement.title.ko}" progress:`, progress);
      
      if (progress.isCompleted && !this.isAchievementUnlocked(achievement.id)) {
        console.log(`🏆 Achievement UNLOCKED: ${achievement.title.ko}!`);
        // Achievement unlocked!
        const userAchievement = await this.unlockAchievement(achievement);
        
        const notification: AchievementNotification = {
          id: `notif_${Date.now()}_${achievement.id}`,
          achievementId: achievement.id,
          achievement,
          unlockedAt: new Date().toISOString(),
          seen: false,
          celebrated: false,
        };
        
        this.notifications.push(notification);
        newUnlocks.push(notification);
      }
      
      // Update progress cache
      this.progressCache.set(achievement.id, progress);
    }

    // Check for exercise-specific achievements
    await this.processExerciseAchievements(workout, newUnlocks);
    
    // Check for consistency achievements
    await this.processConsistencyAchievements(workout, newUnlocks);

    // Save progress
    await this.saveUserProgress();

    return newUnlocks;
  }

  // Check progress for a specific achievement
  private async checkAchievementProgress(
    achievement: Achievement,
    workout: WorkoutHistoryItem
  ): Promise<AchievementProgress> {
    let currentValue = 0;
    let targetValue = achievement.goal.target;

    // Check based on achievement metric
    switch (achievement.goal.metric) {
      case 'workout_count':
        currentValue = await this.getWorkoutCount(achievement);
        break;
      
      case 'total_volume':
        currentValue = workout.totalVolume;
        break;
      
      case 'total_sets':
        currentValue = workout.totalSets;
        break;
      
      case 'exercise_count':
        currentValue = workout.exercises.length;
        break;
      
      case 'sessions_with_exercise_per_week':
        currentValue = await this.getExerciseSessionsPerWeek(achievement);
        break;
      
      case 'reps':
        currentValue = await this.getTotalReps(achievement, workout);
        break;
      
      default:
        currentValue = 0;
    }

    const percentage = Math.min((currentValue / targetValue) * 100, 100);
    const isCompleted = this.checkGoalCompletion(
      currentValue,
      achievement.goal.comparator,
      targetValue
    );

    return {
      achievementId: achievement.id,
      currentValue,
      targetValue,
      percentage,
      isCompleted,
      unlockedAt: isCompleted ? new Date().toISOString() : undefined,
    };
  }

  // Check if goal is completed based on comparator
  private checkGoalCompletion(
    current: number,
    comparator: string,
    target: number
  ): boolean {
    switch (comparator) {
      case '>=': return current >= target;
      case '>': return current > target;
      case '==': return current === target;
      case '<': return current < target;
      case '<=': return current <= target;
      default: return false;
    }
  }

  // Process exercise-specific achievements
  private async processExerciseAchievements(
    workout: WorkoutHistoryItem,
    newUnlocks: AchievementNotification[]
  ) {
    for (const exercise of workout.exercises) {
      const exerciseAchievements = this.achievements.filter(
        a => a.active && 
        a.filters.exercise_ids?.includes(exercise.exerciseId) &&
        a.triggers.includes('exercise.set.logged')
      );

      for (const achievement of exerciseAchievements) {
        const progress = await this.checkExerciseProgress(achievement, exercise);
        
        if (progress.isCompleted && !this.isAchievementUnlocked(achievement.id)) {
          const userAchievement = await this.unlockAchievement(achievement);
          
          const notification: AchievementNotification = {
            id: `notif_${Date.now()}_${achievement.id}`,
            achievementId: achievement.id,
            achievement,
            unlockedAt: new Date().toISOString(),
            seen: false,
            celebrated: false,
          };
          
          this.notifications.push(notification);
          newUnlocks.push(notification);
        }
      }
    }
  }

  // Check exercise-specific progress
  private async checkExerciseProgress(
    achievement: Achievement,
    exercise: any
  ): Promise<AchievementProgress> {
    let currentValue = 0;
    const targetValue = achievement.goal.target;

    // Calculate based on metric
    if (achievement.goal.metric === 'reps') {
      currentValue = exercise.sets.reduce((sum: number, set: any) => 
        sum + parseInt(set.reps || '0'), 0
      );
    } else if (achievement.goal.metric === 'total_volume') {
      currentValue = exercise.totalVolume;
    }

    const percentage = Math.min((currentValue / targetValue) * 100, 100);
    const isCompleted = this.checkGoalCompletion(
      currentValue,
      achievement.goal.comparator,
      targetValue
    );

    return {
      achievementId: achievement.id,
      currentValue,
      targetValue,
      percentage,
      isCompleted,
    };
  }

  // Process consistency achievements
  private async processConsistencyAchievements(
    workout: WorkoutHistoryItem,
    newUnlocks: AchievementNotification[]
  ) {
    const consistencyAchievements = this.achievements.filter(
      a => a.active && a.category === 'consistency'
    );

    for (const achievement of consistencyAchievements) {
      const progress = await this.checkConsistencyProgress(achievement);
      
      if (progress.isCompleted && !this.isAchievementUnlocked(achievement.id)) {
        const userAchievement = await this.unlockAchievement(achievement);
        
        const notification: AchievementNotification = {
          id: `notif_${Date.now()}_${achievement.id}`,
          achievementId: achievement.id,
          achievement,
          unlockedAt: new Date().toISOString(),
          seen: false,
          celebrated: false,
        };
        
        this.notifications.push(notification);
        newUnlocks.push(notification);
      }
    }
  }

  // Check consistency progress (streaks, etc.)
  private async checkConsistencyProgress(
    achievement: Achievement
  ): Promise<AchievementProgress> {
    // This would check workout history for streaks
    // For now, return placeholder
    return {
      achievementId: achievement.id,
      currentValue: 0,
      targetValue: achievement.goal.target,
      percentage: 0,
      isCompleted: false,
    };
  }

  // Unlock an achievement
  private async unlockAchievement(achievement: Achievement): Promise<UserAchievement> {
    const existing = this.userAchievements.get(achievement.id);
    
    const userAchievement: UserAchievement = {
      id: `ua_${Date.now()}_${achievement.id}`,
      userId: 'current_user', // Would get from auth
      achievementId: achievement.id,
      unlockedAt: new Date().toISOString(),
      progress: achievement.goal.target,
      progressTarget: achievement.goal.target,
      isCompleted: true,
      repeatCount: existing ? existing.repeatCount + 1 : 1,
      lastRepeatAt: new Date().toISOString(),
      nextAvailableAt: achievement.repeatable && achievement.repeat_cooldown_days
        ? new Date(Date.now() + achievement.repeat_cooldown_days * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };

    this.userAchievements.set(achievement.id, userAchievement);
    return userAchievement;
  }

  // Get achievement statistics
  async getAchievementStats(): Promise<AchievementStats> {
    const userAchievements = this.getUserAchievements();
    const allAchievements = this.getAllAchievements();

    const categoryBreakdown: AchievementStats['categoryBreakdown'] = {};
    const categories: AchievementCategory[] = [
      'strength', 'consistency', 'body_comp', 'nutrition',
      'cardio', 'recovery', 'social', 'seasonal', 'habit'
    ];

    for (const category of categories) {
      const categoryAchievements = allAchievements.filter(a => a.category === category);
      const unlockedInCategory = userAchievements.filter(
        ua => this.getAchievementById(ua.achievementId)?.category === category
      );

      if (categoryAchievements.length > 0) {
        categoryBreakdown[category] = {
          unlocked: unlockedInCategory.length,
          total: categoryAchievements.length,
        };
      }
    }

    const xpEarned = userAchievements.reduce((sum, ua) => {
      const achievement = this.getAchievementById(ua.achievementId);
      return sum + (achievement?.rewards.xp || 0) * ua.repeatCount;
    }, 0);

    const pointsEarned = userAchievements.reduce((sum, ua) => {
      const achievement = this.getAchievementById(ua.achievementId);
      return sum + (achievement?.rewards.points || 0) * ua.repeatCount;
    }, 0);

    return {
      totalUnlocked: userAchievements.length,
      totalAvailable: allAchievements.length,
      xpEarned,
      pointsEarned,
      completionRate: (userAchievements.length / allAchievements.length) * 100,
      categoryBreakdown,
      recentUnlocks: userAchievements
        .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
        .slice(0, 5),
    };
  }

  // Get unseen achievement notifications
  getUnseenNotifications(): AchievementNotification[] {
    return this.notifications.filter(n => !n.seen);
  }

  // Mark notifications as seen
  async markNotificationsAsSeen(notificationIds: string[]) {
    this.notifications = this.notifications.map(n => 
      notificationIds.includes(n.id) ? { ...n, seen: true } : n
    );
    await this.saveUserProgress();
  }

  // Helper methods for specific metrics
  private async getWorkoutCount(achievement: Achievement): Promise<number> {
    // Would count workouts from history based on window_scope
    return 0;
  }

  private async getExerciseSessionsPerWeek(achievement: Achievement): Promise<number> {
    // Would count exercise sessions per week
    return 0;
  }

  private async getTotalReps(achievement: Achievement, workout: WorkoutHistoryItem): Promise<number> {
    let totalReps = 0;
    
    if (achievement.filters.exercise_ids) {
      // Count reps only for specific exercises
      for (const exercise of workout.exercises) {
        if (achievement.filters.exercise_ids.includes(exercise.exerciseId)) {
          totalReps += exercise.sets.reduce((sum, set) => 
            sum + parseInt(set.reps || '0'), 0
          );
        }
      }
    } else {
      // Count all reps
      totalReps = workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => 
          setSum + parseInt(set.reps || '0'), 0
        ), 0
      );
    }

    return totalReps;
  }

  // Clear all achievement data (for testing/reset)
  async clearAllData() {
    this.userAchievements.clear();
    this.progressCache.clear();
    this.notifications = [];
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ACHIEVEMENTS,
      STORAGE_KEYS.ACHIEVEMENT_PROGRESS,
      STORAGE_KEYS.ACHIEVEMENT_NOTIFICATIONS,
      STORAGE_KEYS.ACHIEVEMENT_STATS,
    ]);
  }

  // Test method to manually unlock first achievement
  async testUnlockFirstAchievement(): Promise<AchievementNotification | null> {
    console.log('🧪 TEST: Manually unlocking first achievement...');
    
    if (this.achievements.length === 0) {
      console.error('❌ No achievements loaded!');
      return null;
    }
    
    const firstAchievement = this.achievements[0];
    console.log('🎯 Unlocking:', firstAchievement.title.ko);
    
    const userAchievement = await this.unlockAchievement(firstAchievement);
    
    const notification: AchievementNotification = {
      id: `test_notif_${Date.now()}`,
      achievementId: firstAchievement.id,
      achievement: firstAchievement,
      unlockedAt: new Date().toISOString(),
      seen: false,
      celebrated: false,
    };
    
    this.notifications.push(notification);
    await this.saveUserProgress();
    
    console.log('✅ Achievement unlocked!');
    return notification;
  }

  // Simplified method to check for first workout achievement
  async checkFirstWorkoutAchievement(): Promise<AchievementNotification[]> {
    console.log('🏃 Checking for first workout achievement...');
    const newUnlocks: AchievementNotification[] = [];
    
    // Find the "First Steps" achievement (첫 발걸음)
    const firstWorkoutAchievement = this.achievements.find(
      a => a.id === 'first_workout' || a.title.ko === '첫 발걸음'
    );
    
    if (!firstWorkoutAchievement) {
      console.log('❌ First workout achievement not found');
      return newUnlocks;
    }
    
    // Check if already unlocked
    if (this.isAchievementUnlocked(firstWorkoutAchievement.id)) {
      console.log('✓ First workout achievement already unlocked');
      return newUnlocks;
    }
    
    // Unlock it!
    console.log('🎊 Unlocking first workout achievement!');
    const userAchievement = await this.unlockAchievement(firstWorkoutAchievement);
    
    const notification: AchievementNotification = {
      id: `notif_${Date.now()}_${firstWorkoutAchievement.id}`,
      achievementId: firstWorkoutAchievement.id,
      achievement: firstWorkoutAchievement,
      unlockedAt: new Date().toISOString(),
      seen: false,
      celebrated: false,
    };
    
    this.notifications.push(notification);
    newUnlocks.push(notification);
    await this.saveUserProgress();
    
    return newUnlocks;
  }

  // Process hydration events for water intake achievements
  async processHydrationEvent(event: any): Promise<AchievementNotification[]> {
    console.log('💧 Processing hydration event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    // Find achievements that can be triggered by hydration events
    const hydrationAchievements = this.achievements.filter(a => 
      a.active && 
      a.triggers.some(trigger => trigger.startsWith('hydration') || trigger.startsWith('habit'))
    );
    
    for (const achievement of hydrationAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process sleep events for sleep achievements
  async processSleepEvent(event: any): Promise<AchievementNotification[]> {
    console.log('😴 Processing sleep event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const sleepAchievements = this.achievements.filter(a => 
      a.active && 
      a.triggers.some(trigger => trigger.startsWith('device.sleep') || trigger.startsWith('habit'))
    );
    
    for (const achievement of sleepAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process nutrition events for diet achievements
  async processNutritionEvent(event: any): Promise<AchievementNotification[]> {
    console.log('🥗 Processing nutrition event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const nutritionAchievements = this.achievements.filter(a => 
      a.active && 
      a.triggers.some(trigger => trigger.startsWith('nutrition') || trigger.startsWith('habit'))
    );
    
    for (const achievement of nutritionAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process body measurement events for body composition achievements
  async processBodyEvent(event: any): Promise<AchievementNotification[]> {
    console.log('📏 Processing body measurement event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const bodyAchievements = this.achievements.filter(a => 
      a.active && 
      a.category === 'body_comp' &&
      a.triggers.some(trigger => trigger.startsWith('body'))
    );
    
    for (const achievement of bodyAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process recovery events for recovery achievements  
  async processRecoveryEvent(event: any): Promise<AchievementNotification[]> {
    console.log('🧘 Processing recovery event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const recoveryAchievements = this.achievements.filter(a => 
      a.active && 
      (a.category === 'recovery' || a.category === 'habit') &&
      a.triggers.some(trigger => 
        trigger.startsWith('recovery') || 
        trigger.startsWith('habit.meditation')
      )
    );
    
    for (const achievement of recoveryAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process cardio events for cardio achievements
  async processCardioEvent(event: any): Promise<AchievementNotification[]> {
    console.log('🏃 Processing cardio event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const cardioAchievements = this.achievements.filter(a => 
      a.active && 
      a.category === 'cardio' &&
      a.triggers.some(trigger => trigger.startsWith('cardio'))
    );
    
    for (const achievement of cardioAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process habit events for habit achievements
  async processHabitEvent(event: any): Promise<AchievementNotification[]> {
    console.log('📋 Processing habit event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const habitAchievements = this.achievements.filter(a => 
      a.active && 
      (a.category === 'habit' || a.category === 'consistency') &&
      a.triggers.some(trigger => trigger.startsWith('habit'))
    );
    
    for (const achievement of habitAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Process social events for social achievements
  async processSocialEvent(event: any): Promise<AchievementNotification[]> {
    console.log('👥 Processing social event:', event);
    const newUnlocks: AchievementNotification[] = [];
    
    const socialAchievements = this.achievements.filter(a => 
      a.active && 
      a.category === 'social' &&
      a.triggers.some(trigger => trigger.startsWith('social'))
    );
    
    for (const achievement of socialAchievements) {
      if (await this.checkEventAchievement(achievement, event)) {
        const notification = await this.createAchievementNotification(achievement);
        if (notification) {
          newUnlocks.push(notification);
        }
      }
    }
    
    await this.saveUserProgress();
    return newUnlocks;
  }

  // Generic method to check if an event satisfies an achievement
  private async checkEventAchievement(achievement: Achievement, event: any): Promise<boolean> {
    // Check if already unlocked (unless repeatable)
    if (this.isAchievementUnlocked(achievement.id) && !achievement.repeatable) {
      return false;
    }
    
    // Check if event type matches achievement triggers
    const matchingTrigger = achievement.triggers.find(trigger => 
      event.type === trigger || event.type.startsWith(trigger.split('.')[0])
    );
    
    if (!matchingTrigger) {
      return false;
    }
    
    // Check goal condition
    const eventValue = this.extractEventValue(achievement.goal.metric, event);
    
    return this.checkGoalCompletion(
      eventValue,
      achievement.goal.comparator,
      achievement.goal.target
    );
  }

  // Extract relevant value from event data based on metric
  private extractEventValue(metric: string, event: any): number {
    const data = event.data || {};
    
    // Map common metrics to event data fields
    const metricMappings: { [key: string]: string } = {
      'water_ml_per_day': 'water_ml_per_day',
      'sleep_hours_per_day': 'sleep_hours_per_day',
      'protein_g_per_day': 'protein_g_per_day',
      'processed_food_items_per_day': 'processed_food_items_per_day',
      'weight_delta_kg': 'weight_delta_kg',
      'waist_delta_cm': 'waist_delta_cm',
      'bodyfat_delta_pct': 'bodyfat_delta_pct',
      'recovery_sessions_per_week': 'recovery_sessions_per_week',
      'meditation_min_per_day': 'meditation_min_per_day',
      'running_distance_today_km': 'running_distance_today_km',
      'run_time_for_distance_min': 'run_time_for_distance_min',
      'rowing_2k_time_min': 'rowing_2k_time_min',
      'social_posts': 'social_posts',
      'invited_friends_signed_up': 'invited_friends_signed_up',
      'leaderboard_rank': 'leaderboard_rank',
    };
    
    const dataField = metricMappings[metric] || metric;
    return parseFloat(data[dataField]) || 0;
  }

  // Create achievement notification if not already unlocked
  private async createAchievementNotification(achievement: Achievement): Promise<AchievementNotification | null> {
    if (this.isAchievementUnlocked(achievement.id) && !achievement.repeatable) {
      return null;
    }
    
    const userAchievement = await this.unlockAchievement(achievement);
    
    const notification: AchievementNotification = {
      id: `notif_${Date.now()}_${achievement.id}`,
      achievementId: achievement.id,
      achievement,
      unlockedAt: new Date().toISOString(),
      seen: false,
      celebrated: false,
    };
    
    this.notifications.push(notification);
    return notification;
  }

  // Process all types of events - unified entry point  
  async processEvent(eventType: string, eventData: any): Promise<AchievementNotification[]> {
    // First try backend API
    if (await this.isBackendAvailable()) {
      try {
        console.log('🌐 Processing event via backend API:', eventType);
        const result = await achievementApiService.processAchievementEvent(eventType, eventData);
        console.log('✅ Backend API response:', result);
        return result.notifications || [];
      } catch (error) {
        console.error('❌ Backend API error, falling back to local processing:', error);
        this.useBackendApi = false; // Disable for this session
      }
    }
    
    // Fallback to local processing
    console.log('💾 Processing event locally:', eventType);
    const event = { type: eventType, data: eventData };
    
    if (eventType.startsWith('hydration')) {
      return this.processHydrationEvent(event);
    } else if (eventType.startsWith('device.sleep')) {
      return this.processSleepEvent(event);
    } else if (eventType.startsWith('nutrition')) {
      return this.processNutritionEvent(event);
    } else if (eventType.startsWith('body')) {
      return this.processBodyEvent(event);
    } else if (eventType.startsWith('recovery') || eventType.includes('meditation')) {
      return this.processRecoveryEvent(event);
    } else if (eventType.startsWith('cardio')) {
      return this.processCardioEvent(event);
    } else if (eventType.startsWith('habit')) {
      return this.processHabitEvent(event);
    } else if (eventType.startsWith('social')) {
      return this.processSocialEvent(event);
    }
    
    console.warn('🤷 Unknown event type:', eventType);
    return [];
  }

  // Check water intake achievements
  async checkWaterIntakeAchievements(currentIntake: number, dailyGoal: number): Promise<void> {
    console.log('💧 Checking water intake achievements:', { currentIntake, dailyGoal });
    
    const event = {
      type: 'hydration.logged',
      data: {
        date: new Date().toISOString(),
        water_ml: currentIntake,
        daily_goal_ml: dailyGoal,
        water_ml_per_day: currentIntake,
        percentage_of_goal: (currentIntake / dailyGoal) * 100
      }
    };
    
    await this.processHydrationEvent(event);
  }

  // Process meditation achievements
  async processMeditationEvent(durationMinutes: number): Promise<AchievementNotification[]> {
    console.log('🧘 Processing meditation event:', { durationMinutes });
    
    const event = {
      type: 'habit.meditation',
      data: {
        date: new Date().toISOString(),
        meditation_min_per_day: durationMinutes,
        duration_minutes: durationMinutes
      }
    };
    
    return this.processEvent('habit.meditation', event.data);
  }

  // Process sleep tracking achievements
  async processSleepTracking(sleepHours: number, sleepQuality?: number): Promise<AchievementNotification[]> {
    console.log('😴 Processing sleep tracking:', { sleepHours, sleepQuality });
    
    const event = {
      type: 'device.sleep.logged',
      data: {
        date: new Date().toISOString(),
        sleep_hours_per_day: sleepHours,
        duration_hours: sleepHours,
        quality_score: sleepQuality || 0
      }
    };
    
    return this.processEvent('device.sleep.logged', event.data);
  }

  // Process nutrition achievements
  async processNutritionGoals(proteinGrams: number, processedFoodItems: number): Promise<AchievementNotification[]> {
    console.log('🥗 Processing nutrition goals:', { proteinGrams, processedFoodItems });
    
    const event = {
      type: 'nutrition.goal.met',
      data: {
        date: new Date().toISOString(),
        protein_g_per_day: proteinGrams,
        processed_food_items_per_day: processedFoodItems
      }
    };
    
    return this.processEvent('nutrition.goal.met', event.data);
  }

  // Process body measurement achievements
  async processBodyMeasurements(measurements: {
    weight?: number;
    waist?: number;
    bodyFat?: number;
    previousWeight?: number;
    previousWaist?: number;
    previousBodyFat?: number;
  }): Promise<AchievementNotification[]> {
    console.log('📏 Processing body measurements:', measurements);
    
    const event = {
      type: 'body.measurement.logged',
      data: {
        date: new Date().toISOString(),
        weight_delta_kg: measurements.weight && measurements.previousWeight 
          ? measurements.previousWeight - measurements.weight : 0,
        waist_delta_cm: measurements.waist && measurements.previousWaist
          ? measurements.previousWaist - measurements.waist : 0,
        bodyfat_delta_pct: measurements.bodyFat && measurements.previousBodyFat
          ? measurements.previousBodyFat - measurements.bodyFat : 0,
        current_weight: measurements.weight,
        current_waist: measurements.waist,
        current_bodyfat: measurements.bodyFat
      }
    };
    
    return this.processEvent('body.measurement.logged', event.data);
  }

  // Process cardio achievements
  async processCardioSession(type: 'running' | 'rowing', data: any): Promise<AchievementNotification[]> {
    console.log('🏃 Processing cardio session:', { type, data });
    
    let eventType = '';
    let eventData = { date: new Date().toISOString(), ...data };
    
    if (type === 'running') {
      eventType = 'cardio.run.completed';
      eventData = {
        ...eventData,
        running_distance_today_km: data.distance_km || 0,
        run_time_for_distance_min: data.duration_minutes || 0
      };
    } else if (type === 'rowing') {
      eventType = 'cardio.row.completed';
      eventData = {
        ...eventData,
        rowing_2k_time_min: data.time_for_2k_minutes || 0
      };
    }
    
    return this.processEvent(eventType, eventData);
  }

  // Process social achievements
  async processSocialActivity(type: 'post' | 'invite' | 'leaderboard', data: any): Promise<AchievementNotification[]> {
    console.log('👥 Processing social activity:', { type, data });
    
    let eventType = '';
    let eventData = { date: new Date().toISOString(), ...data };
    
    if (type === 'post') {
      eventType = 'social.post.shared';
      eventData = {
        ...eventData,
        social_posts: data.post_count || 1
      };
    } else if (type === 'invite') {
      eventType = 'social.friend.invited';
      eventData = {
        ...eventData,
        invited_friends_signed_up: data.signup_count || 1
      };
    } else if (type === 'leaderboard') {
      eventType = 'social.leaderboard.ranked';
      eventData = {
        ...eventData,
        leaderboard_rank: data.rank || 1
      };
    }
    
    return this.processEvent(eventType, eventData);
  }

  // Get achievements with progress information
  async getAchievementsWithProgress(): Promise<(Achievement & { progress?: AchievementProgress; userAchievement?: UserAchievement })[]> {
    const achievements = this.getAllAchievements();
    
    return achievements.map(achievement => {
      const progress = this.getAchievementProgress(achievement.id);
      const userAchievement = this.userAchievements.get(achievement.id);
      
      return {
        ...achievement,
        progress,
        userAchievement
      };
    });
  }
}

// Export singleton instance
const achievementService = new AchievementService();
export default achievementService;