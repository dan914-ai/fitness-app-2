import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createRef } from 'react';

export const navigationRef = createRef<NavigationContainerRef<any>>();

export function navigate(name: string, params?: any) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('NavigationService: Navigator not ready for direct navigation');
    setTimeout(() => navigate(name, params), 100);
  }
}

export function navigateToTab(tabName: string, screenName?: string, screenParams?: any) {
  
  if (!navigationRef.current) {
    console.error('NavigationService: navigationRef.current is null');
    return;
  }
  
  if (!navigationRef.current.isReady()) {
    console.warn('NavigationService: Navigator not ready, retrying in 100ms');
    setTimeout(() => {
      navigateToTab(tabName, screenName, screenParams);
    }, 100);
    return;
  }
  
  try {
    if (screenName) {
      // Navigate through Main to tab with nested screen
      navigationRef.current.navigate('Main', {
        screen: tabName,
        params: {
          screen: screenName,
          params: screenParams
        }
      });
    } else {
      // Navigate through Main to tab
      navigationRef.current.navigate('Main', {
        screen: tabName
      });
    }
  } catch (error) {
    console.error('NavigationService: Navigation failed', error);
  }
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function dispatch(action: any) {
  navigationRef.current?.dispatch(action);
}

// Helper functions for specific tab navigation
export function navigateToMenu(screenName?: string, params?: any) {
  navigateToTab('메뉴', screenName, params);
}

export function navigateToRecord(screenName?: string, params?: any) {
  navigateToTab('기록', screenName, params);
}

export function navigateToStats(screenName?: string, params?: any) {
  navigateToTab('통계', screenName, params);
}

export function navigateToSocial(screenName?: string, params?: any) {
  navigateToTab('소셜', screenName, params);
}

export function navigateToHome(screenName?: string, params?: any) {
  navigateToTab('홈', screenName, params);
}

export default {
  navigate,
  navigateToTab,
  navigateToMenu,
  navigateToRecord,
  navigateToStats,
  navigateToSocial,
  navigateToHome,
  goBack,
  dispatch
};