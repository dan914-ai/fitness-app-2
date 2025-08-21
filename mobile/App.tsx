import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notification.service';
import { WorkoutProvider } from './src/contexts/WorkoutContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { checkBackendConnection } from './src/utils/backendConnection';
import networkService from './src/services/network.service';
import OfflineIndicator from './src/components/common/OfflineIndicator';
import LoadingIndicator from './src/components/common/LoadingIndicator';
import ErrorBoundary from './src/components/ErrorBoundary';
import secureStorage from './src/utils/secureStorage';

export default function App() {
  const [appError, setAppError] = React.useState<Error | null>(null);

  useEffect(() => {
    console.log('🚀🚀🚀 APP VERSION 4.0 - FORCE RESET - ' + new Date().toISOString());
    console.warn('🔥🔥🔥 If you see VERSION 4.0, the new code is loaded!');
    console.log('App: Starting initialization');
    try {
      // Migrate tokens to secure storage on first launch
      secureStorage.migrateTokens().catch(err => 
        console.warn('Token migration warning:', err)
      );
      
      
      // Initialize network monitoring first
      networkService.initialize();
      
      // Check backend connection on startup
      checkBackendConnection();
      
      // Initialize notifications
      notificationService.initialize();

      // Add notification listeners
      notificationService.addNotificationListeners(
        (notification) => {
          console.log('Notification received:', notification);
        },
        (response) => {
          console.log('Notification response:', response);
          // Handle notification tap
          const data = response.notification.request.content.data;
          if (data?.type === 'workout_reminder') {
            // Navigate to workout screen
          } else if (data?.type === 'social') {
            // Navigate to social screen
          } else if (data?.type === 'achievement') {
            // Navigate to achievements screen
          }
        }
      );
    } catch (error) {
      console.error('App: Error during initialization:', error);
      setAppError(error as Error);
    }

    // Cleanup function
    return () => {
      networkService.cleanup();
    };
  }, []);

  if (appError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error initializing app: {appError.message}</Text>
      </View>
    );
  }

  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <View style={styles.container}>
          <WorkoutProvider>
            <OfflineIndicator position="top" />
            <AppNavigator />
            <LoadingIndicator />
            <StatusBar style="auto" />
          </WorkoutProvider>
        </View>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
