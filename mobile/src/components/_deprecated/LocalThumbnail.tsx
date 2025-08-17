import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { thumbnailGeneratorService } from '../../services/thumbnailGenerator.service';

interface LocalThumbnailProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  style?: any;
  size?: number;
  fallbackColor?: string;
  priority?: 'high' | 'normal' | 'low';
}

export default function LocalThumbnail({
  exerciseId,
  exerciseName,
  muscleGroup,
  style,
  size = 60,
  fallbackColor,
  priority = 'normal',
}: LocalThumbnailProps) {
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [imageState, setImageState] = useState<'loading' | 'local' | 'placeholder'>('loading');

  // Get muscle group color for placeholder
  const muscleColors: Record<string, string> = {
    '가슴': '#FF6B6B', '등': '#4ECDC4', '어깨': '#FFE66D', '이두근': '#95E1D3',
    '삼두근': '#F38181', '대퇴사두근': '#AA96DA', '햄스트링': '#FCBAD3', '둔근': '#A8E6CF',
    '복근': '#FFD93D', '종아리': '#6BCB77', '전완근': '#FF8B94', '승모근': '#C39BD3',
    '복합운동': '#F7DC6F', '유산소': '#85C1E9',
  };
  
  const placeholderColor = fallbackColor || muscleColors[muscleGroup] || Colors.primary;
  const displayText = muscleGroup?.charAt(0) || exerciseName?.charAt(0) || '?';

  // Load thumbnail when component mounts
  useEffect(() => {
    let mounted = true;

    const loadThumbnail = async () => {
      try {
        // First try to get local thumbnail
        const localThumbnailPath = await thumbnailGeneratorService.getThumbnailPath(exerciseId);
        
        if (mounted) {
          if (localThumbnailPath) {
            setLocalPath(localThumbnailPath);
            setImageState('local');
          } else {
            // No local thumbnail, show placeholder
            setImageState('placeholder');
          }
        }
      } catch (error) {
        console.error(`Failed to load thumbnail for ${exerciseId}:`, error);
        if (mounted) {
          setImageState('placeholder');
        }
      }
    };

    // Delay loading based on priority
    const delay = priority === 'high' ? 0 : priority === 'normal' ? 50 : 100;
    const timeoutId = setTimeout(loadThumbnail, delay);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [exerciseId, priority]);

  const handleImageLoad = () => {
    // Image loaded successfully
  };

  const handleImageError = () => {
    // If local/GIF fails, show placeholder
    setImageState('placeholder');
  };

  // Render based on current state
  if (imageState === 'loading') {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      </View>
    );
  }

  if (imageState === 'local' && localPath) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Image
          source={{ uri: localPath }}
          style={{ width: size, height: size, borderRadius: 8 }}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          fadeDuration={0}
        />
      </View>
    );
  }


  // Placeholder fallback
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
        <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
          {displayText.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});