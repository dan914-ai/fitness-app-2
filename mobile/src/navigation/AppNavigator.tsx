import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList, MainTabParamList, AuthStackParamList, HomeStackParamList, RecordStackParamList, WellnessStackParamList, StatsStackParamList, MenuStackParamList } from './types';
import { Colors } from '../constants/colors';
import authService from '../services/auth.service';
import { supabase } from '../config/supabase';
import { getMockSession } from '../utils/testAuthWorkaround';
import { useMockAuth } from '../contexts/MockAuthContext';

// Import screens
import LoginScreenProduction from '../screens/auth/LoginScreenProduction';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import RoutineDetailScreen from '../screens/home/RoutineDetailScreen';
import CreateRoutineScreen from '../screens/home/CreateRoutineScreen';
import RoutineManagementScreen from '../screens/home/RoutineManagementScreen';
import ExerciseTrackScreen from '../screens/home/ExerciseTrackScreen';
import WorkoutSessionScreen from '../screens/home/WorkoutSessionScreen';
import WorkoutSessionScreenSimple from '../screens/home/WorkoutSessionScreenSimple';
import TestWorkoutScreen from '../screens/TestWorkoutScreen';
import WorkoutCompleteScreen from '../screens/home/WorkoutCompleteScreen';
import RecordScreen from '../screens/record/RecordScreen';
import CreateWorkoutScreen from '../screens/record/CreateWorkoutScreen';
import ExerciseSelectionScreen from '../screens/record/ExerciseSelectionScreen';
import ActiveWorkoutScreen from '../screens/record/ActiveWorkoutScreen';
import WorkoutHistoryScreen from '../screens/record/WorkoutHistoryScreen';
import WorkoutDetailScreen from '../screens/record/WorkoutDetailScreen';
import WorkoutSummaryScreen from '../screens/record/WorkoutSummaryScreen';
import ExerciseHistoryScreen from '../screens/record/ExerciseHistoryScreen';
import ProgressPhotosScreen from '../screens/record/ProgressPhotosScreen';
import BodyMeasurementsScreen from '../screens/record/BodyMeasurementsScreen';
import InBodyScreen from '../screens/record/InBodyScreen';
import AddInBodyRecordScreen from '../screens/record/AddInBodyRecordScreen';
import InBodySuccessScreen from '../screens/record/InBodySuccessScreen';
import StatsScreen from '../screens/stats/StatsScreenFinal';
import WorkoutAnalyticsScreen from '../screens/stats/WorkoutAnalyticsScreen';
import StrengthProgressScreen from '../screens/stats/StrengthProgressScreen';
import AchievementsScreen from '../screens/stats/AchievementsScreen';
import DataExportScreen from '../screens/stats/DataExportScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import ProfileScreen from '../screens/menu/ProfileScreen';
import SettingsScreen from '../screens/menu/SettingsScreen';
import NotificationSettingsScreen from '../screens/menu/NotificationSettingsScreen';
import LanguageSettingsScreen from '../screens/menu/LanguageSettingsScreen';
import UnitSettingsScreen from '../screens/menu/UnitSettingsScreen';
import PrivacySettingsScreen from '../screens/menu/PrivacySettingsScreen';
import AboutScreen from '../screens/menu/AboutScreen';
import HelpScreen from '../screens/menu/HelpScreen';
import WorkoutProgramsScreen from '../screens/menu/WorkoutProgramsScreen';
import OneRMCalculatorScreen from '../screens/calculators/OneRMCalculatorScreen';
import CalorieCalculatorScreen from '../screens/calculators/CalorieCalculatorScreen';
import MacroCalculatorScreen from '../screens/calculators/MacroCalculatorScreen';
import DiagnosticScreen from '../screens/DiagnosticScreen';
import QuickTimerScreen from '../screens/home/QuickTimerScreen';
import WaterIntakeScreen from '../screens/home/WaterIntakeScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import { ComponentShowcase } from '../screens/test/ComponentShowcase';
import { ExerciseTestScreen } from '../screens/ExerciseTestScreen';

// Wellness Screens
import WellnessScreen from '../screens/wellness/WellnessScreen';
import NutritionTrackingScreen from '../screens/wellness/NutritionTrackingScreen';

// Recovery screens
// import RecoveryDashboardScreen from '../screens/home/RecoveryDashboardScreen';
import DOMSSurveyScreen from '../screens/home/DOMSSurveyScreenUnified';
// import RecoveryHistoryScreen from '../screens/home/RecoveryHistoryScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const RecordStack = createStackNavigator<RecordStackParamList>();
const WellnessStack = createStackNavigator<WellnessStackParamList>();
const StatsStack = createStackNavigator<StatsStackParamList>();
const MenuStack = createStackNavigator<MenuStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreenProduction} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Diagnostic" component={DiagnosticScreen} />
    </AuthStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="RoutineDetail" 
        component={RoutineDetailScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="CreateRoutine" 
        component={CreateRoutineScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="RoutineManagement" 
        component={RoutineManagementScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="ExerciseTrack" 
        component={ExerciseTrackScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="WorkoutSession" 
        component={WorkoutSessionScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="TestWorkout" 
        component={TestWorkoutScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="ComponentShowcase" 
        component={ComponentShowcase}
        options={{ title: 'Design System Components' }}
      />
      <HomeStack.Screen 
        name="WorkoutComplete" 
        component={WorkoutCompleteScreen}
        options={{ headerShown: false }}
      />
      {/* Temporarily commented out for testing */}
      <HomeStack.Screen 
        name="QuickTimer" 
        component={QuickTimerScreen}
        options={{ title: '빠른 타이머' }}
      />
      <HomeStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      {/*<HomeStack.Screen 
        name="RecoveryDashboard" 
        component={RecoveryDashboardScreen}
        options={{ headerShown: false }}
      />*/}
      <HomeStack.Screen 
        name="DOMSSurvey" 
        component={DOMSSurveyScreen}
        options={{ headerShown: false }}
      />
      {/*<HomeStack.Screen 
        name="RecoveryHistory" 
        component={RecoveryHistoryScreen}
        options={{ headerShown: false }}
      />*/}
    </HomeStack.Navigator>
  );
}

function RecordStackNavigator() {
  return (
    <RecordStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <RecordStack.Screen 
        name="RecordMain" 
        component={RecordScreen}
        options={{ headerShown: false }}
      />
      <RecordStack.Screen 
        name="CreateWorkout" 
        component={CreateWorkoutScreen}
        options={{ title: '새 운동' }}
      />
      <RecordStack.Screen 
        name="ExerciseSelection" 
        component={ExerciseSelectionScreen}
        options={{ title: '운동 선택' }}
      />
      <RecordStack.Screen 
        name="ActiveWorkout" 
        component={ActiveWorkoutScreen}
        options={{ 
          title: '운동 중',
          headerLeft: () => null, // Prevent going back during workout
          gestureEnabled: false,
        }}
      />
      <RecordStack.Screen 
        name="WorkoutComplete" 
        component={WorkoutCompleteScreen}
        options={{ 
          title: '운동 완료',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <RecordStack.Screen 
        name="WorkoutHistory" 
        component={WorkoutHistoryScreen}
        options={{ headerShown: false }}
      />
      <RecordStack.Screen 
        name="WorkoutDetail" 
        component={WorkoutDetailScreen}
        options={{ headerShown: false }}
      />
      <RecordStack.Screen 
        name="WorkoutSummary" 
        component={WorkoutSummaryScreen}
        options={{ headerShown: false }}
      />
      <RecordStack.Screen 
        name="ExerciseHistory" 
        component={ExerciseHistoryScreen}
        options={{ headerShown: false }}
      />
      <RecordStack.Screen 
        name="ProgressPhotos" 
        component={ProgressPhotosScreen}
        options={{ title: '진행 사진' }}
      />
      <RecordStack.Screen 
        name="BodyMeasurements" 
        component={BodyMeasurementsScreen}
        options={{ title: '신체 측정' }}
      />
      <RecordStack.Screen 
        name="InBodyScreen" 
        component={InBodyScreen}
        options={{ headerShown: false }}
      />
      <RecordStack.Screen 
        name="AddInBodyRecord" 
        component={AddInBodyRecordScreen}
        options={{ title: '인바디 기록 추가' }}
      />
      <RecordStack.Screen 
        name="InBodySuccess" 
        component={InBodySuccessScreen}
        options={{ headerShown: false }}
      />
    </RecordStack.Navigator>
  );
}

function WellnessStackNavigator() {
  return (
    <WellnessStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <WellnessStack.Screen 
        name="WellnessMain" 
        component={WellnessScreen}
        options={{ title: '웰니스' }}
      />
      <WellnessStack.Screen 
        name="WaterIntake" 
        component={WaterIntakeScreen}
        options={{ title: '수분 섭취' }}
      />
      <WellnessStack.Screen 
        name="MacroCalculator" 
        component={MacroCalculatorScreen}
        options={{ title: '매크로 계산기' }}
      />
      <WellnessStack.Screen 
        name="NutritionTracking" 
        component={NutritionTrackingScreen}
        options={{ title: '영양 & 칼로리' }}
      />
    </WellnessStack.Navigator>
  );
}

function StatsStackNavigator() {
  return (
    <StatsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <StatsStack.Screen 
        name="StatsMain" 
        component={StatsScreen}
        options={{ headerShown: false }}
      />
      <StatsStack.Screen 
        name="WorkoutAnalytics" 
        component={WorkoutAnalyticsScreen}
        options={{ headerShown: false }}
      />
      <StatsStack.Screen 
        name="StrengthProgress" 
        component={StrengthProgressScreen}
        options={{ headerShown: false }}
      />
      <StatsStack.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ headerShown: false }}
      />
      <StatsStack.Screen 
        name="DataExport" 
        component={DataExportScreen}
        options={{ headerShown: false }}
      />
    </StatsStack.Navigator>
  );
}

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <MenuStack.Screen 
        name="MenuMain" 
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="LanguageSettings" 
        component={LanguageSettingsScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="UnitSettings" 
        component={UnitSettingsScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="PrivacySettings" 
        component={PrivacySettingsScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="WorkoutPrograms" 
        component={WorkoutProgramsScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen 
        name="OneRMCalculator" 
        component={OneRMCalculatorScreen}
        options={{ title: '1RM 계산기' }}
      />
      <MenuStack.Screen 
        name="CalorieCalculator" 
        component={CalorieCalculatorScreen}
        options={{ title: '칼로리 계산기' }}
      />
      <MenuStack.Screen 
        name="MacroCalculator" 
        component={MacroCalculatorScreen}
        options={{ title: '매크로 계산기' }}
      />
      <MenuStack.Screen 
        name="ExerciseTest" 
        component={ExerciseTestScreen}
        options={{ title: '운동 GIF 테스트' }}
      />
    </MenuStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case '홈':
              iconName = 'home';
              break;
            case '기록':
              iconName = 'edit-note';
              break;
            case '웰니스':
              iconName = 'favorite';
              break;
            case '통계':
              iconName = 'bar-chart';
              break;
            case '메뉴':
              iconName = 'menu';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="홈" 
        component={HomeStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="기록" 
        component={RecordStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="웰니스" 
        component={WellnessStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="통계" 
        component={StatsStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="메뉴" 
        component={MenuStackNavigator} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  
  // Authentication control
  const SKIP_LOGIN = false; // Production mode - authentication required
  
  const [isLoading, setIsLoading] = useState(!SKIP_LOGIN); // Don't show loading if skipping login
  const [isAuthenticated, setIsAuthenticated] = useState(SKIP_LOGIN); // Auto-authenticate if skipping
  const { isMockAuthenticated } = useMockAuth();

  useEffect(() => {
    if (SKIP_LOGIN) {
      // Set up mock user data for testing
      AsyncStorage.setItem('user', JSON.stringify({
        id: 'test-user-123',
        email: 'test@example.com',
        username: 'testuser',
      }));
      AsyncStorage.setItem('authToken', 'mock-token-123');
      AsyncStorage.setItem('using_mock_auth', 'true');
      return;
    }
    
    checkAuthStatus();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // React to mock auth changes
  useEffect(() => {
    if (!SKIP_LOGIN) {
      if (isMockAuthenticated) {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [isMockAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      // First check for mock auth
      const mockSession = await getMockSession();
      if (mockSession) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // Then check regular Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (SKIP_LOGIN) {
  } else {
  }
  
  // Debug authentication states
    SKIP_LOGIN,
    isAuthenticated,
    isMockAuthenticated,
    shouldShowMain: SKIP_LOGIN || isAuthenticated || isMockAuthenticated
  });

  // Proper authentication check (restored)
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {(SKIP_LOGIN || isAuthenticated || isMockAuthenticated) ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}