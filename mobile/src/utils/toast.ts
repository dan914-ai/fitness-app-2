import { Alert, ToastAndroid, Platform } from 'react-native';

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, use a simple alert or you could implement a custom toast
    // For now, we'll only show errors as alerts on iOS
    if (type === 'error') {
      Alert.alert('오류', message);
    }
    // Success and info messages could be shown in a custom component
  }
};

export const showSuccess = (message: string) => showToast(message, 'success');
export const showError = (message: string) => showToast(message, 'error');
export const showInfo = (message: string) => showToast(message, 'info');