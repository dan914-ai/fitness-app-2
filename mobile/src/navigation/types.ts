import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Diagnostic: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  홈: NavigatorScreenParams<HomeStackParamList>; // Home
  기록: NavigatorScreenParams<RecordStackParamList>; // Records
  웰니스: NavigatorScreenParams<WellnessStackParamList>; // Wellness
  통계: NavigatorScreenParams<StatsStackParamList>; // Statistics
  소셜: NavigatorScreenParams<SocialStackParamList>; // Social
  메뉴: NavigatorScreenParams<MenuStackParamList>; // Menu
};

// Wellness Stack
export type WellnessStackParamList = {
  WellnessMain: undefined;
  WaterIntake: undefined;
  SleepTracking: undefined;
  NutritionTracking: undefined;
  CalorieCalculator: undefined;
  MacroCalculator: undefined;
  MoodTracking: undefined;
  StressManagement: undefined;
  WellnessGoals: undefined;
  WellnessInsights: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  ThumbnailTest: undefined;
  RoutineDetail: { routineId: string; routineName: string };
  CreateRoutine: undefined;
  RoutineManagement: undefined;
  ExerciseTrack: { exerciseId: string; exerciseName: string; routineId: string };
  WorkoutStart: undefined;
  WorkoutActive: { workoutId: string };
  WorkoutSession: { routineId: string; fallbackExercises?: any[] };
  TestWorkout: { routineId: string };
  WorkoutComplete: { workoutId: string };
  ExerciseSelect: undefined;
  ExerciseDetail: { exerciseId: string };
  Notifications: undefined;
  RecoveryDashboard: undefined;
  DOMSSurvey: undefined;
  RecoveryHistory: undefined;
  QuickTimer: undefined;
};

// Record Stack
export type RecordStackParamList = {
  RecordMain: undefined;
  WorkoutHistory: { selectedDate?: Date } | undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutSummary: { workoutId: string };
  ExerciseHistory: { exerciseId: string; exerciseName: string };
  CreateWorkout: { selectedExercises?: any[]; repeatWorkoutId?: string } | undefined;
  ExerciseSelection: { selectedExercises?: string[] };
  ActiveWorkout: { workoutId: string };
  WorkoutComplete: { workoutId: string };
  ProgressPhotos: undefined;
  BodyMeasurements: undefined;
  InBodyScreen: undefined;
  AddInBodyRecord: undefined;
  InBodySuccess: {
    recordData?: {
      date: string;
      weight: number;
      skeletalMuscleMass: number;
      bodyFatMass: number;
      bodyFatPercentage: number;
      height: number;
      bmi: number;
    };
  };
};

// Stats Stack
export type StatsStackParamList = {
  StatsMain: undefined;
  WorkoutAnalytics: undefined;
  StrengthProgress: undefined;
  Achievements: undefined;
  DataExport: undefined;
};

// Social Stack
export type SocialStackParamList = {
  SocialMain: undefined;
  Feed: undefined;
  UserSearch: undefined;
  Challenges: undefined;
  UserProfile: { userId: string };
  ChallengeDetail: { challengeId: string };
  CreatePost: undefined;
  PostDetail: { postId: string };
  Followers: { userId: string };
  Following: { userId: string };
  Notifications: undefined;
};

// Menu Stack
export type MenuStackParamList = {
  MenuMain: undefined;
  Profile: undefined;
  Settings: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  PrivacySettings: undefined;
  UnitSettings: undefined;
  About: undefined;
  Help: undefined;
  WorkoutPrograms: undefined;
  ExerciseTest: undefined;
  OneRMCalculator: undefined;
  CalorieCalculator: undefined;
  MacroCalculator: undefined;
  HabitTracking: undefined;
  SleepTracking: undefined;
  WaterIntake: undefined;
  NutritionTracking: undefined;
  RecoveryTracking: undefined;
  HabitHistory: undefined;
  QuickTimer: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    StackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type RecordStackScreenProps<T extends keyof RecordStackParamList> =
  CompositeScreenProps<
    StackScreenProps<RecordStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type StatsStackScreenProps<T extends keyof StatsStackParamList> =
  CompositeScreenProps<
    StackScreenProps<StatsStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type SocialStackScreenProps<T extends keyof SocialStackParamList> =
  CompositeScreenProps<
    StackScreenProps<SocialStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type MenuStackScreenProps<T extends keyof MenuStackParamList> =
  CompositeScreenProps<
    StackScreenProps<MenuStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;