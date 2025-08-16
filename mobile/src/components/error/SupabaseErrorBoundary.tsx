import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { supabase } from '../../config/supabase';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isSupabaseError: boolean;
  isNetworkError: boolean;
  retryCount: number;
}

export default class SupabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isSupabaseError: false,
      isNetworkError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a Supabase-related error
    const isSupabaseError = 
      error.message?.includes('supabase') ||
      error.message?.includes('Supabase') ||
      error.message?.includes('PGRST') ||
      error.message?.includes('JWT') ||
      error.message?.includes('auth');
    
    const isNetworkError = 
      error.message?.includes('Network') ||
      error.message?.includes('fetch') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT');

    return {
      hasError: true,
      error,
      isSupabaseError,
      isNetworkError,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to monitoring service
    console.error('Supabase Error Boundary caught:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = async () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      Alert.alert(
        '연결 실패',
        '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    this.setState({ 
      hasError: false, 
      error: null,
      retryCount: retryCount + 1 
    });

    // Test Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
    } catch (error) {
      this.setState({
        hasError: true,
        error: error as Error,
        isSupabaseError: true,
        isNetworkError: true,
      });
    }
  };

  handleOfflineMode = () => {
    Alert.alert(
      '오프라인 모드',
      '일부 기능이 제한될 수 있습니다.',
      [{ text: '확인' }]
    );
    
    this.setState({ 
      hasError: false, 
      error: null 
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isSupabaseError, isNetworkError } = this.state;

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Icon 
              name={isNetworkError ? "wifi-off" : "error-outline"} 
              size={64} 
              color={Colors.error} 
            />
            
            <Text style={styles.title}>
              {isNetworkError 
                ? '연결 오류' 
                : isSupabaseError 
                  ? '서버 오류'
                  : '오류 발생'}
            </Text>
            
            <Text style={styles.message}>
              {isNetworkError
                ? '인터넷 연결을 확인해주세요.'
                : isSupabaseError
                  ? '서버와 연결할 수 없습니다.'
                  : '예기치 않은 오류가 발생했습니다.'}
            </Text>

            {__DEV__ && error && (
              <Text style={styles.errorDetails}>
                {error.message}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button}
                onPress={this.handleRetry}
              >
                <Icon name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>다시 시도</Text>
              </TouchableOpacity>

              {isNetworkError && (
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={this.handleOfflineMode}
                >
                  <Icon name="offline-bolt" size={20} color={Colors.text} />
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    오프라인 계속
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorDetails: {
    fontSize: 12,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 6,
  },
  secondaryButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: Colors.text,
  },
});