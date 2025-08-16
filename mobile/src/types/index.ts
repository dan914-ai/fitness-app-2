import { ImageSourcePropType } from 'react-native';

export interface User {
  userId: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  bio?: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  gender?: string;
  userTier: string;
  totalPoints: number;
  workoutCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface Exercise {
  exerciseId: string;
  exerciseName: string;
  category: string;
  muscleGroup: string;
  equipment?: string;
  difficulty: string;
  
  /** Always a local require() asset for lists */
  thumbnail: ImageSourcePropType;
  
  /** Remote GIF URL for detail screens only */
  gifUrl?: string;
  
  /** @deprecated Do not use. Kept for compatibility until we migrate all call sites. */
  imageUrl?: string | ImageSourcePropType;
}

export interface Workout {
  workoutId: string;
  workoutDate: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  totalCalories?: number;
  workoutRating?: number;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  workoutExerciseId: string;
  exercise: Exercise;
  sets: ExerciseSet[];
}

export interface ExerciseSet {
  setId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  isWarmup: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  status: string;
}

// Social Features Types
export interface SocialPost {
  postId: string;
  userId: string;
  user?: User;
  username: string;
  userTier: string;
  content: string;
  imageUrl?: string;
  mediaUrls?: string[];
  workoutId?: string;
  workout?: Workout;
  workoutData?: {
    exerciseName: string;
    sets?: number;
    maxWeight?: number;
    duration?: number;
    distance?: number;
    pace?: string;
  };
  challengeId?: string;
  challengeData?: {
    challengeName: string;
    progress: number;
    daysCompleted: number;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  privacySetting: 'public' | 'private';
  createdAt: string;
  updatedAt?: string;
}

export interface PostComment {
  commentId: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface PostLike {
  likeId: string;
  postId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface UserFollow {
  followId: string;
  followerId: string;
  followingId: string;
  follower: User;
  following: User;
  createdAt: string;
}

export interface Challenge {
  challengeId: string;
  challengeName: string;
  description: string;
  challengeType: string;
  startDate: string;
  endDate: string;
  targetValue?: number;
  rewardPoints: number;
  participantsCount: number;
  isParticipating: boolean;
  userProgress?: number;
  userRank?: number;
  createdAt: string;
}

export interface ChallengeParticipant {
  participantId: string;
  challengeId: string;
  userId: string;
  user: User;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  rank?: number;
  joinedAt: string;
}

export interface LeaderboardEntry {
  user: User;
  progress: number;
  rank: number;
  isCompleted: boolean;
}

export interface FeedItem {
  type: 'post' | 'workout' | 'achievement' | 'challenge';
  id: string;
  user: User;
  content: string;
  timestamp: string;
  data?: any;
}

export interface UserStats {
  workoutsCount: number;
  totalWorkoutTime: number;
  totalCalories: number;
  currentStreak: number;
  maxStreak: number;
  followersCount: number;
  followingCount: number;
  achievementsCount: number;
  challengesCompleted: number;
}

export interface SearchResult {
  users: User[];
  challenges: Challenge[];
  posts: SocialPost[];
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'challenge' | 'achievement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// Analytics Types
export interface WorkoutAnalytics {
  summary: {
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    avgDuration: number;
    avgCalories: number;
    avgRating: number;
    currentStreak: number;
    maxStreak: number;
    workoutFrequency: string;
  };
  charts: {
    dailyData: DailyWorkoutData[];
    weeklyFrequency: number[];
    muscleGroupData: MuscleGroupData[];
  };
}

export interface DailyWorkoutData {
  date: string;
  workouts: number;
  duration: number;
  calories: number;
}

export interface MuscleGroupData {
  name: string;
  count: number;
}

export interface StrengthProgress {
  exercises: ExerciseProgress[];
  summary: {
    exercisesTracked: number;
    avgWeightImprovement: number;
    avgVolumeImprovement: number;
  };
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  data: StrengthData[];
  improvements: {
    weight: number;
    volume: number;
  };
}

export interface StrengthData {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  sets: number;
}

export interface BodyMeasurements {
  measurements: BodyMeasurementData[];
  trends: BodyMeasurementTrends;
  summary: {
    totalMeasurements: number;
    latestMeasurement: BodyMeasurementData | null;
    measurementFrequency: number;
  };
}

export interface BodyMeasurementData {
  measurementId?: string;
  date: string;
  weight?: number | null;
  bodyFatPercentage?: number | null;
  muscleMass?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  thigh?: number | null;
  bicep?: number | null;
}

export interface BodyMeasurementTrends {
  weight: TrendData;
  bodyFatPercentage: TrendData;
  muscleMass: TrendData;
  chest: TrendData;
  waist: TrendData;
  hips: TrendData;
  thigh: TrendData;
  bicep: TrendData;
}

export interface TrendData {
  change: number;
  percentage: number;
}

export interface ProgressPhotos {
  photos: ProgressPhotoData[];
  photosByMonth: { [key: string]: ProgressPhotoData[] };
  summary: {
    totalPhotos: number;
    photosThisMonth: number;
  };
}

export interface ProgressPhotoData {
  photoId: string;
  photoUrl: string;
  takenDate: string;
  weight?: number | null;
  notes?: string;
}

export interface UserAchievements {
  achievements: AchievementData[];
  achievementsByCategory: { [key: string]: AchievementData[] };
  summary: {
    totalEarned: number;
    totalAvailable: number;
    totalPoints: number;
    completionPercentage: number;
    recentAchievements: RecentAchievement[];
  };
}

export interface AchievementData {
  achievementId: string;
  achievementName: string;
  description: string;
  category: string;
  requiredValue: number;
  points: number;
  badgeImageUrl?: string;
  isEarned: boolean;
  earnedAt?: string;
  currentProgress: number;
  progressPercentage: number;
}

export interface RecentAchievement {
  achievementId: string;
  achievementName: string;
  points: number;
  earnedAt: string;
}

export interface OverallStats {
  user: {
    userId: string;
    username: string;
    userTier: string;
    totalPoints: number;
    profileImageUrl?: string;
  };
  stats: {
    workouts: {
      total: number;
      thisWeek: number;
      totalDuration: number;
      totalCalories: number;
      avgDuration: number;
      avgCalories: number;
    };
    strength: {
      totalSets: number;
      totalVolume: number;
      avgVolumePerWorkout: number;
    };
    consistency: {
      currentStreak: number;
      workoutsThisWeek: number;
      workoutFrequency: string;
    };
    social: {
      followersCount: number;
      followingCount: number;
      challengesParticipated: number;
    };
    achievements: {
      totalEarned: number;
      totalPoints: number;
    };
    body: {
      latestWeight?: number | null;
      totalPhotos: number;
      latestPhotoDate?: string;
    };
  };
  recentActivity: {
    workoutsThisWeek: number;
    lastWorkoutDate?: string;
    photosThisMonth: number;
    measurementsThisMonth: number;
  };
}

export interface ChartConfig {
  backgroundGradientFrom: string;
  backgroundGradientFromOpacity: number;
  backgroundGradientTo: string;
  backgroundGradientToOpacity: number;
  color: (opacity: number) => string;
  strokeWidth: number;
  barPercentage: number;
  useShadowColorFromDataset: boolean;
  decimalPlaces: number;
}