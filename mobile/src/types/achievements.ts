// Achievement System Types
export type AchievementCategory = 
  | 'strength'
  | 'consistency'
  | 'body_comp'
  | 'nutrition'
  | 'cardio'
  | 'recovery'
  | 'social'
  | 'seasonal'
  | 'habit';


export type AchievementRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export type AchievementVisibility = 
  | 'public'
  | 'hidden'
  | 'seasonal';

export type WindowScope = 
  | 'session'
  | 'day'
  | 'week'
  | 'month'
  | 'season'
  | 'lifetime';

export type EventType = 
  | 'workout.logged'
  | 'exercise.set.logged'
  | 'exercise.pr'
  | 'cardio.run.logged'
  | 'cardio.row.logged'
  | 'recovery.logged'
  | 'habit.meditation.logged'
  | 'body.weight.logged'
  | 'body.measure.logged'
  | 'body.scan.logged'
  | 'nutrition.logged'
  | 'device.steps.logged'
  | 'device.sleep.logged'
  | 'device.energy.logged'
  | 'social.post.created'
  | 'referral.completed'
  | 'leaderboard.updated'
  | 'challenge.started'
  | 'challenge.completed';

export interface AchievementTitle {
  ko: string;
  en: string;
}

export interface AchievementGoal {
  metric: string;
  comparator: '>=' | '>' | '==' | '<' | '<=';
  target: number;
  unit: string;
  per_week_target?: number;
  window_weeks?: number;
}

export interface AchievementFilters {
  exercise_ids?: string[];
  time_of_day?: string[];
  muscle_groups?: string[];
}

export interface AchievementRewards {
  xp: number;
  points: number;
  badge_id: string | null;
  title_id: string | null;
}

export interface AchievementValidation {
  source: string[];
  method: 'max' | 'sum' | 'count' | 'any' | 'count_days_meeting' | 'weeks_meeting_workout_days';
  aggregation: 'rolling' | 'fixed_window' | 'lifetime';
  min_sessions: number;
}

export interface AchievementSafety {
  min_days?: number;
  max_attempts?: number;
}

export interface SeasonalWindow {
  start_date?: string;
  end_date?: string;
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  visibility: AchievementVisibility;
  title: AchievementTitle;
  description: AchievementTitle;
  icon: string;
  duration_days: number | null;
  window_scope: WindowScope;
  goal: AchievementGoal;
  filters: AchievementFilters;
  triggers: EventType[];
  repeatable: boolean;
  repeat_cooldown_days: number | null;
  rewards: AchievementRewards;
  validation: AchievementValidation;
  safety: AchievementSafety;
  links: {
    challenge_ids: string[];
  };
  created_at: string;
  active: boolean;
  seasonal_window: SeasonalWindow;
}

export interface UserAchievement {
  id: string;
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

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isCompleted: boolean;
  unlockedAt?: string;
  nextMilestone?: number;
}

export interface AchievementNotification {
  id: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
  seen: boolean;
  celebrated: boolean;
}

// Helper type for achievement stats
export interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  xpEarned: number;
  pointsEarned: number;
  completionRate: number;
  categoryBreakdown: {
    [key in AchievementCategory]?: {
      unlocked: number;
      total: number;
    };
  };
  recentUnlocks: UserAchievement[];
}