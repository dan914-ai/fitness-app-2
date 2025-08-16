import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

interface AuthRequiredIndicatorProps {
  message?: string;
  showLoginButton?: boolean;
  onLoginPress?: () => void;
}

export default function AuthRequiredIndicator({
  message = '로그인이 필요한 기능입니다',
  showLoginButton = true,
  onLoginPress,
}: AuthRequiredIndicatorProps) {
  const navigation = useNavigation();

  const handleLoginPress = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      // Navigate to login screen
      navigation.navigate('Auth' as any, { screen: 'Login' });
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="lock-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.message}>{message}</Text>
      {showLoginButton && (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLoginPress}
        >
          <Text style={styles.loginButtonText}>로그인하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});