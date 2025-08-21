import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '../../constants/colors';

interface NetworkAwareGifDisplayProps {
  gifUrl?: string;
  fallbackUrl?: string;
  placeholder?: any;
  exerciseName: string;
  width?: number;
  height?: number;
  onRetry?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function NetworkAwareGifDisplay({
  gifUrl,
  fallbackUrl,
  placeholder,
  exerciseName,
  width = screenWidth - 32,
  height = 200,
  onRetry,
}: NetworkAwareGifDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(gifUrl);

  useEffect(() => {
    // Check network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentUrl(gifUrl);
    setError(false);
    setLoading(true);
  }, [gifUrl]);

  const handleLoadError = () => {
    setLoading(false);
    setError(true);
    
    // Try fallback URL if available and not already tried
    if (fallbackUrl && currentUrl !== fallbackUrl && retryCount < 2) {
      setCurrentUrl(fallbackUrl);
      setRetryCount(retryCount + 1);
      setError(false);
      setLoading(true);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setCurrentUrl(gifUrl);
    setError(false);
    setLoading(true);
    
    if (onRetry) {
      onRetry();
    }
  };

  // Offline state
  if (isOffline) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.errorContent}>
          <Icon name="wifi-off" size={48} color={Colors.textSecondary} />
          <Text style={styles.errorTitle}>오프라인 상태</Text>
          <Text style={styles.errorMessage}>
            인터넷 연결을 확인해주세요
          </Text>
          {placeholder && (
            <Image
              source={placeholder}
              style={[styles.placeholderImage, { width: width * 0.8, height: height * 0.6 }]}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.errorContent}>
          <Icon name="error-outline" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>이미지를 불러올 수 없습니다</Text>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          
          {placeholder ? (
            <Image
              source={placeholder}
              style={[styles.placeholderImage, { width: width * 0.8, height: height * 0.6 }]}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.placeholderBox, { width: width * 0.8, height: height * 0.6 }]}>
              <Icon name="fitness-center" size={48} color={Colors.textSecondary} />
            </View>
          )}
          
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}
      
      {currentUrl ? (
        <Image
          source={{ uri: currentUrl }}
          style={[styles.image, { width, height }]}
          resizeMode="contain"
          onLoad={() => setLoading(false)}
          onError={handleLoadError}
        />
      ) : placeholder ? (
        <Image
          source={placeholder}
          style={[styles.image, { width, height }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.placeholderBox, { width, height }]}>
          <Icon name="fitness-center" size={48} color={Colors.textSecondary} />
          <Text style={styles.exerciseName}>{exerciseName}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  image: {
    backgroundColor: Colors.cardBackground,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  exerciseName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  placeholderImage: {
    opacity: 0.5,
    marginVertical: 16,
  },
  placeholderBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});