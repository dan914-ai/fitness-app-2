import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import loadingService, { LoadingOperation } from '../../services/loading.service';

interface Props {
  style?: any;
  size?: 'small' | 'large';
  color?: string;
  showOverlay?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function LoadingIndicator({ 
  style, 
  size = 'large', 
  color = Colors.primary,
  showOverlay = true 
}: Props) {
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const [animatedOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = loadingService.addListener((operationsMap) => {
      const activeOperations = Array.from(operationsMap.values());
      setOperations(activeOperations);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const hasOperations = operations.length > 0;
    
    Animated.timing(animatedOpacity, {
      toValue: hasOperations ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [operations]);

  const primaryOperation = loadingService.getPrimaryOperation();
  
  if (!primaryOperation) {
    return null;
  }

  const renderContent = () => (
    <View style={styles.container}>
      <View style={styles.loadingCard}>
        {primaryOperation.type === 'progress' && primaryOperation.progress !== undefined ? (
          <ProgressIndicator 
            progress={primaryOperation.progress} 
            color={color}
          />
        ) : primaryOperation.type === 'skeleton' ? (
          <SkeletonLoader />
        ) : primaryOperation.type === 'shimmer' ? (
          <ShimmerLoader />
        ) : (
          <ActivityIndicator 
            size={size} 
            color={color} 
            style={styles.spinner}
          />
        )}
        
        <Text style={styles.loadingText}>{primaryOperation.message}</Text>
        
        {primaryOperation.progress !== undefined && primaryOperation.type !== 'progress' && (
          <Text style={styles.progressText}>
            {Math.round(primaryOperation.progress)}%
          </Text>
        )}
      </View>
    </View>
  );

  if (primaryOperation.overlay && showOverlay) {
    return (
      <Modal
        transparent
        visible={true}
        animationType="none"
      >
        <Animated.View 
          style={[styles.overlay, { opacity: animatedOpacity }]}
        >
          {renderContent()}
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.inline,
        { opacity: animatedOpacity },
        style
      ]}
    >
      {renderContent()}
    </Animated.View>
  );
}

// Progress bar component
function ProgressIndicator({ progress, color }: { progress: number; color: string }) {
  const [animatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill,
            { 
              backgroundColor: color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
}

// Skeleton loader for content placeholders
function SkeletonLoader() {
  const [animatedOpacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View 
        style={[styles.skeletonLine, styles.skeletonTitle, { opacity: animatedOpacity }]} 
      />
      <Animated.View 
        style={[styles.skeletonLine, styles.skeletonSubtitle, { opacity: animatedOpacity }]} 
      />
      <Animated.View 
        style={[styles.skeletonLine, styles.skeletonText, { opacity: animatedOpacity }]} 
      />
    </View>
  );
}

// Shimmer loader for list items
function ShimmerLoader() {
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.shimmerContainer}>
      <View style={styles.shimmerBackground}>
        <Animated.View 
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX }] }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skeletonContainer: {
    width: 200,
    marginBottom: 16,
  },
  skeletonLine: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTitle: {
    height: 20,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 16,
    width: '60%',
  },
  skeletonText: {
    height: 14,
    width: '90%',
  },
  shimmerContainer: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  shimmerBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
});

// Hook for using loading states in components
export function useLoading() {
  const [operations, setOperations] = useState<LoadingOperation[]>([]);

  useEffect(() => {
    const unsubscribe = loadingService.addListener((operationsMap) => {
      setOperations(Array.from(operationsMap.values()));
    });

    return unsubscribe;
  }, []);

  return {
    operations,
    isLoading: operations.length > 0,
    isLoadingId: (id: string) => loadingService.isLoading(id),
    startLoading: (operation: LoadingOperation) => loadingService.startLoading(operation),
    stopLoading: (id: string) => loadingService.stopLoading(id),
    updateProgress: (id: string, progress: number, message?: string) => 
      loadingService.updateProgress(id, progress, message),
    withLoading: loadingService.withLoading.bind(loadingService),
  };
}