import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface NetworkStatusIndicatorProps {
  // Display options
  showWhenOnline?: boolean;
  showQuality?: boolean;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  autoHideDelay?: number;
  
  // Style customization
  style?: any;
  compact?: boolean;
  
  // Callbacks
  onPress?: () => void;
  onRetry?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * NetworkStatusIndicator - Real-time network status display with retry functionality
 * 
 * Features:
 * - Real-time network status monitoring
 * - Connection quality indicator
 * - Automatic show/hide based on network changes
 * - Manual retry button for failed requests
 * - Smooth animations for status changes
 * - Customizable positioning and styling
 */
const NetworkStatusIndicator = memo(({
  showWhenOnline = false,
  showQuality = true,
  position = 'top',
  autoHide = true,
  autoHideDelay = 3000,
  style,
  compact = false,
  onPress,
  onRetry,
}: NetworkStatusIndicatorProps) => {
  const { networkStatus, retryFailedRequests, refreshNetworkStatus } = useNetworkStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Determine if indicator should be shown
  const shouldShow = React.useMemo(() => {
    if (!networkStatus.isOnline) return true; // Always show when offline
    if (showWhenOnline) return true; // Show when online if configured
    if (networkStatus.connectionQuality === 'poor') return true; // Show for poor connection
    return false;
  }, [networkStatus.isOnline, networkStatus.connectionQuality, showWhenOnline]);

  // Handle visibility changes with animation
  useEffect(() => {
    if (shouldShow && !isVisible) {
      setIsVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && isVisible && autoHide) {
      // Auto-hide after delay when network is restored
      const hideTimer = setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
        });
      }, autoHideDelay);

      return () => clearTimeout(hideTimer);
    }
  }, [shouldShow, isVisible, autoHide, autoHideDelay, animation]);

  const handlePress = React.useCallback(() => {
    if (onPress) {
      onPress();
    } else if (!networkStatus.isOnline) {
      // Default behavior: refresh network status when offline
      refreshNetworkStatus();
    }
  }, [onPress, networkStatus.isOnline, refreshNetworkStatus]);

  const handleRetry = React.useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      // Default behavior: retry failed requests
      retryFailedRequests();
      refreshNetworkStatus();
    }
  }, [onRetry, retryFailedRequests, refreshNetworkStatus]);

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return Colors.error;
    switch (networkStatus.connectionQuality) {
      case 'excellent':
      case 'good':
        return Colors.success;
      case 'poor':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) return 'wifi-off';
    switch (networkStatus.connectionQuality) {
      case 'excellent':
        return 'signal-wifi-4-bar';
      case 'good':
        return 'signal-wifi-3-bar';
      case 'poor':
        return 'signal-wifi-1-bar';
      default:
        return 'signal-wifi-off';
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) {
      return compact ? '오프라인' : '인터넷 연결이 없습니다';
    }
    
    if (!showQuality) return '온라인';
    
    switch (networkStatus.connectionQuality) {
      case 'excellent':
        return compact ? '우수' : '연결 상태 우수';
      case 'good':
        return compact ? '양호' : '연결 상태 양호';
      case 'poor':
        return compact ? '불안정' : '연결이 불안정합니다';
      default:
        return compact ? '연결됨' : '연결됨';
    }
  };

  if (!isVisible) return null;

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  const statusText = getStatusText();

  const containerStyle = [
    styles.container,
    compact && styles.containerCompact,
    position === 'bottom' && styles.containerBottom,
    { backgroundColor: statusColor + '15', borderColor: statusColor + '30' },
    style,
  ];

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: position === 'top' ? [-50, 0] : [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Status Icon */}
        <MaterialIcons
          name={statusIcon as any}
          size={compact ? 16 : 20}
          color={statusColor}
        />

        {/* Status Text */}
        <Text style={[styles.statusText, compact && styles.statusTextCompact, { color: statusColor }]}>
          {statusText}
        </Text>

        {/* Connection Details */}
        {!compact && (
          <Text style={styles.detailText}>
            {networkStatus.isConnected ? '연결됨' : '연결 안됨'} • {' '}
            {networkStatus.isInternetReachable ? '인터넷 사용 가능' : '인터넷 사용 불가'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Retry Button */}
      {!networkStatus.isOnline && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: statusColor }]}
          onPress={handleRetry}
          activeOpacity={0.7}
        >
          <MaterialIcons name="refresh" size={16} color={statusColor} />
          {!compact && <Text style={[styles.retryText, { color: statusColor }]}>재시도</Text>}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

NetworkStatusIndicator.displayName = 'NetworkStatusIndicator';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  containerBottom: {
    top: undefined,
    bottom: 100,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusTextCompact: {
    fontSize: 12,
  },
  detailText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NetworkStatusIndicator;