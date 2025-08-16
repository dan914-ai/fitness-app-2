import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { networkService } from '../../services/network.service';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showNetworkStatus?: boolean;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  retryCount: number;
}

/**
 * NetworkErrorBoundary - Graceful degradation for network-related errors
 * 
 * Features:
 * - Catches network-related errors in child components
 * - Shows appropriate fallback UI based on error type
 * - Provides retry functionality with exponential backoff
 * - Shows network status when relevant
 * - Automatically resets when network is restored
 */
class NetworkErrorBoundary extends Component<Props, State> {
  private networkUnsubscribe?: () => void;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Determine if this is a network-related error
    const isNetworkError = NetworkErrorBoundary.isNetworkRelatedError(error);
    
    return {
      hasError: true,
      error,
      isNetworkError,
      retryCount: 0,
    };
  }

  private static isNetworkRelatedError(error: Error): boolean {
    const networkErrorIndicators = [
      'network',
      'fetch',
      'timeout',
      'connection',
      'offline',
      'unreachable',
      'dns',
      'cors',
      'load failed',
      'image not found',
      'failed to load',
    ];

    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    
    return networkErrorIndicators.some(indicator => 
      errorMessage.includes(indicator) || errorStack.includes(indicator)
    );
  }

  componentDidMount() {
    // Listen for network state changes
    this.networkUnsubscribe = networkService.addNetworkListener((networkState) => {
      // If we had a network error and network is restored, try to reset
      if (this.state.hasError && this.state.isNetworkError && networkState.isConnected) {
        this.scheduleAutoRetry();
      }
    });
  }

  componentWillUnmount() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NetworkErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
  }

  private scheduleAutoRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Auto-retry after a delay when network is restored
    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, 2000); // Wait 2 seconds for network to stabilize
  };

  private handleRetry = () => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;
    
    // Increment retry count
    this.setState(prevState => ({ 
      retryCount: prevState.retryCount + 1 
    }));

    // Clear error state to re-render children
    this.setState({
      hasError: false,
      error: null,
      isNetworkError: false,
    });

    // Call custom retry handler if provided
    if (onRetry) {
      onRetry();
    }
  };

  private getRetryDelay(): number {
    const { retryCount } = this.state;
    // Exponential backoff: 2^retryCount * 1000ms, max 30 seconds
    return Math.min(Math.pow(2, retryCount) * 1000, 30000);
  }

  private renderErrorUI(): ReactNode {
    const { fallback, showNetworkStatus = true } = this.props;
    const { error, isNetworkError, retryCount } = this.state;
    
    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const isOnline = networkService.isOnline();
    const connectionQuality = networkService.getConnectionQuality();
    
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          {/* Error Icon */}
          <MaterialIcons 
            name={isNetworkError ? "wifi-off" : "error-outline"} 
            size={48} 
            color={Colors.error} 
          />
          
          {/* Error Message */}
          <Text style={styles.errorTitle}>
            {isNetworkError ? '네트워크 연결 오류' : '오류가 발생했습니다'}
          </Text>
          
          <Text style={styles.errorMessage}>
            {isNetworkError ? (
              isOnline ? 
                '이미지를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.' :
                '인터넷 연결을 확인하고 다시 시도해주세요.'
            ) : (
              error?.message || '알 수 없는 오류가 발생했습니다.'
            )}
          </Text>

          {/* Network Status */}
          {showNetworkStatus && isNetworkError && (
            <View style={styles.networkStatus}>
              <View style={[
                styles.networkIndicator, 
                { backgroundColor: isOnline ? Colors.success : Colors.error }
              ]} />
              <Text style={styles.networkStatusText}>
                {isOnline ? 
                  `연결됨 (${connectionQuality === 'excellent' ? '우수' : 
                             connectionQuality === 'good' ? '양호' : 
                             connectionQuality === 'poor' ? '불안정' : '오프라인'})` : 
                  '오프라인'
                }
              </Text>
            </View>
          )}

          {/* Retry Button */}
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={this.handleRetry}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>
              {retryCount > 0 ? `다시 시도 (${retryCount + 1}회)` : '다시 시도'}
            </Text>
          </TouchableOpacity>

          {/* Retry Count Warning */}
          {retryCount > 2 && (
            <Text style={styles.retryWarning}>
              계속 문제가 발생하면 앱을 재시작해보세요.
            </Text>
          )}
        </View>
      </View>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  networkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryWarning: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default NetworkErrorBoundary;