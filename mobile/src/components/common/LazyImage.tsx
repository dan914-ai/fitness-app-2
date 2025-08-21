import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  Platform,
  Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: { uri: string } | number;
  fadeIn?: boolean;
  showLoading?: boolean;
  loadingColor?: string;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Lazy loading image component with progressive loading
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  placeholder,
  fadeIn = true,
  showLoading = true,
  loadingColor = Colors.primary,
  priority = 'normal',
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Priority-based loading delay
    const delay = priority === 'high' ? 0 : priority === 'normal' ? 100 : 200;
    
    const timer = setTimeout(() => {
      // Force load after delay
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [priority]);

  const handleLoadEnd = () => {
    setIsLoading(false);
    
    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Use placeholder if available and image hasn't loaded
  const imageSource = hasError && placeholder ? placeholder : source;

  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoading && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}>
          <ActivityIndicator size="small" color={loadingColor} />
        </View>
      )}
      
      <Animated.Image
        {...props}
        source={imageSource}
        style={[
          style,
          fadeIn && { opacity: fadeAnim }
        ]}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

/**
 * Optimized image component for exercise thumbnails
 */
export const ExerciseThumbnail: React.FC<{
  uri: string;
  size?: number;
  style?: any;
}> = ({ uri, size = 80, style }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lazy load image after component mount
    const timer = setTimeout(() => {
      setImageUri(uri);
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [uri]);

  if (isLoading || !imageUri) {
    return (
      <View style={[styles.thumbnail, { width: size, height: size }, style]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={[styles.thumbnail, { width: size, height: size }, style]}
      resizeMode="cover"
    />
  );
};

/**
 * Batch image loader for list views
 */
export const useBatchImageLoader = (
  images: string[],
  batchSize: number = 5
) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [currentBatch, setCurrentBatch] = useState(0);

  useEffect(() => {
    const loadBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, images.length);
      const batch = images.slice(start, end);

      setLoadedImages(prev => {
        const newSet = new Set(prev);
        batch.forEach(img => newSet.add(img));
        return newSet;
      });

      if (end < images.length) {
        // Load next batch after delay
        setTimeout(() => {
          setCurrentBatch(prev => prev + 1);
        }, 200);
      }
    };

    loadBatch();
  }, [currentBatch, images, batchSize]);

  return loadedImages;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  thumbnail: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
});

export default LazyImage;