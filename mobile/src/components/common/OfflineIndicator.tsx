import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import networkService, { NetworkState, BackendConnectionState } from '../../services/network.service';

interface Props {
  style?: any;
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export default function OfflineIndicator({ 
  style, 
  showWhenOnline = false,
  position = 'top'
}: Props) {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [backendState, setBackendState] = useState<BackendConnectionState | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const [animatedOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initialize network service if not already done
    networkService.initialize();

    // Get initial states
    setNetworkState(networkService.getCurrentNetworkState());
    setBackendState(networkService.getCurrentBackendState());

    // Subscribe to network changes
    const unsubscribeNetwork = networkService.addNetworkListener((state) => {
      setNetworkState(state);
    });

    // Subscribe to backend changes
    const unsubscribeBackend = networkService.addBackendListener((state) => {
      setBackendState(state);
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeBackend();
    };
  }, []);

  useEffect(() => {
    const shouldShow = getShouldShow();
    
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: shouldShow ? (isExpanded ? 120 : 60) : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [networkState, backendState, isExpanded, showWhenOnline]);

  const getShouldShow = (): boolean => {
    if (!networkState) return false;
    
    const isOffline = !networkService.isOnline();
    const backendDown = !networkService.isBackendAvailable();
    
    return isOffline || backendDown || showWhenOnline;
  };

  const getStatus = (): {
    type: 'offline' | 'backend_down' | 'online' | 'poor_connection';
    message: string;
    icon: string;
    color: string;
  } => {
    if (!networkState) {
      return {
        type: 'offline',
        message: '연결 상태 확인 중...',
        icon: 'signal-wifi-off',
        color: Colors.textSecondary,
      };
    }

    if (!networkState.isConnected) {
      return {
        type: 'offline',
        message: '인터넷에 연결되지 않음',
        icon: 'signal-wifi-off',
        color: Colors.error,
      };
    }

    if (networkState.isInternetReachable === false) {
      return {
        type: 'offline',
        message: '인터넷 접근 불가',
        icon: 'signal-wifi-off',
        color: Colors.error,
      };
    }

    if (!networkService.isBackendAvailable()) {
      const retryCount = backendState?.retryCount || 0;
      return {
        type: 'backend_down',
        message: `서버 연결 불가${retryCount > 0 ? ` (재시도 ${retryCount}회)` : ''}`,
        icon: 'cloud-off',
        color: Colors.warning,
      };
    }

    const quality = networkService.getConnectionQuality();
    if (quality === 'poor') {
      return {
        type: 'poor_connection',
        message: '연결 상태가 불안정합니다',
        icon: 'signal-wifi-1-bar',
        color: Colors.warning,
      };
    }

    return {
      type: 'online',
      message: '온라인',
      icon: 'wifi',
      color: Colors.success,
    };
  };

  const handleRetry = async () => {
    try {
      setIsExpanded(true);
      await networkService.forceBackendCheck();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const status = getStatus();
  
  if (!getShouldShow()) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        position === 'bottom' && styles.containerBottom,
        { height: animatedHeight, opacity: animatedOpacity },
        style,
      ]}
    >
      <TouchableOpacity 
        style={[styles.header, { backgroundColor: status.color + '15' }]}
        onPress={handleToggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.statusInfo}>
          <Icon name={status.icon} size={20} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.message}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {(status.type === 'offline' || status.type === 'backend_down') && (
            <TouchableOpacity
              style={[styles.retryButton, { borderColor: status.color }]}
              onPress={handleRetry}
            >
              <Icon name="refresh" size={16} color={status.color} />
            </TouchableOpacity>
          )}
          
          <Icon 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={20} 
            color={status.color} 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>네트워크:</Text>
            <Text style={styles.detailValue}>
              {networkState?.type || 'unknown'} 
              {networkState?.isConnected ? ' (연결됨)' : ' (연결 안됨)'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>서버:</Text>
            <Text style={styles.detailValue}>
              {backendState?.isBackendAvailable ? '사용 가능' : '사용 불가'}
            </Text>
          </View>
          
          {backendState?.lastChecked && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>마지막 확인:</Text>
              <Text style={styles.detailValue}>
                {backendState.lastChecked.toLocaleTimeString('ko-KR')}
              </Text>
            </View>
          )}
          
          <Text style={styles.offlineMessage}>
            {status.type === 'offline' 
              ? '오프라인 모드에서는 일부 기능이 제한될 수 있습니다.'
              : status.type === 'backend_down'
              ? '서버 연결이 복구되면 자동으로 동기화됩니다.'
              : '모든 기능을 정상적으로 사용할 수 있습니다.'
            }
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  containerBottom: {
    top: undefined,
    bottom: 0,
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  details: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: Colors.text,
  },
  offlineMessage: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
});