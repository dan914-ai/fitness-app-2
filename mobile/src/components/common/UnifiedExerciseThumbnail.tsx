import React, { memo, useState, useCallback } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ActivityIndicator,
  Text,
  ImageSourcePropType
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { staticThumbnails, getStaticThumbnail } from '../../constants/staticThumbnails';
import NetworkAwareImage from './NetworkAwareImage';

/**
 * UNIFIED EXERCISE THUMBNAIL COMPONENT
 * 
 * This single component replaces ALL of these:
 * - ExerciseThumbnail (both versions)
 * - FastThumbnail
 * - OptimizedThumbnail
 * - StaticThumbnail
 * - InstantThumbnail
 * - LocalThumbnail
 * - HybridThumbnail
 * - StaticGifThumbnail
 * - StaticFirstFrame
 * 
 * Supports ALL existing use cases for backward compatibility
 */

interface UnifiedExerciseThumbnailProps {
  // Support both interfaces for backward compatibility
  
  // From /components/ExerciseThumbnail (simple version)
  source?: any; // URL string, local asset, or null
  
  // From /components/common/ExerciseThumbnail (complex version)
  exerciseId?: string | number;
  exerciseName?: string;
  muscleGroup?: string;
  gifUrl?: string;
  
  // Common props
  size?: number;
  style?: any;
  showModal?: boolean;
  
  // New unified props
  variant?: 'simple' | 'interactive' | 'static'; // Control behavior
  onPress?: () => void; // Custom press handler
}

const { width: screenWidth } = Dimensions.get('window');

const UnifiedExerciseThumbnail = memo(({
  // Simple interface props
  source,
  
  // Complex interface props
  exerciseId,
  exerciseName = '',
  muscleGroup,
  gifUrl,
  
  // Common props
  size = 60,
  style,
  showModal = true,
  
  // New props
  variant = 'interactive',
  onPress,
}: UnifiedExerciseThumbnailProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [gifLoading, setGifLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);
  
  // BACKWARD COMPATIBILITY: Support both usage patterns
  
  // Pattern 1: Using source prop (simple version)
  if (source !== undefined && variant === 'simple') {
    if (!source) {
      // Show placeholder if no source
      return (
        <View style={[styles.placeholder, { width: size, height: size }, style]}>
          <MaterialIcons name="fitness-center" size={24} color={Colors.textSecondary} />
          <Text style={styles.placeholderText}>{muscleGroup || '운동'}</Text>
        </View>
      );
    }
    
    const imageSource = typeof source === 'string' 
      ? { uri: source }
      : source;
    
    return (
      <Image
        source={imageSource}
        style={[styles.image, { width: size, height: size }, style]}
        resizeMode="cover"
        defaultSource={undefined}
        fadeDuration={0}
      />
    );
  }
  
  // Pattern 2: Using exerciseId (complex version with static thumbnails)
  const thumbnail = exerciseId ? getStaticThumbnail(exerciseId) : null;
  
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else if (showModal && gifUrl && variant === 'interactive') {
      setModalVisible(true);
      setGifLoading(true);
    }
  }, [gifUrl, showModal, variant, onPress]);
  
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);
  
  const handleGifLoad = useCallback(() => {
    setGifLoading(false);
  }, []);

  const handleThumbnailError = useCallback(() => {
    setThumbnailError(true);
  }, []);

  // Fallback colors for muscle groups (from FastThumbnail)
  const getMuscleColor = (muscle?: string): string => {
    const colors: Record<string, string> = {
      '가슴': '#FF6B6B',
      '등': '#4ECDC4',
      '어깨': '#FFE66D',
      '이두근': '#95E1D3',
      '삼두근': '#F38181',
      '대퇴사두근': '#AA96DA',
      '햄스트링': '#FCBAD3',
      '둔근': '#A8E6CF',
      '복근': '#FFD3B6',
      '종아리': '#FFAAA5',
      '전완근': '#FF8B94',
      '이두': '#95E1D3',
      '삼두': '#F38181',
      '하체': '#AA96DA',
      '코어': '#FFD3B6',
      'default': '#B8B8B8',
    };
    return colors[muscle || ''] || colors.default;
  };

  // Render thumbnail or fallback
  const renderThumbnail = () => {
    if (thumbnail && !thumbnailError) {
      return (
        <Image
          source={thumbnail}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="cover"
          onError={handleThumbnailError}
        />
      );
    }
    
    // Fallback to colored placeholder (from FastThumbnail)
    const backgroundColor = getMuscleColor(muscleGroup);
    const initial = exerciseName ? exerciseName.charAt(0).toUpperCase() : '?';
    
    return (
      <View style={[
        styles.colorPlaceholder,
        { 
          width: size, 
          height: size,
          backgroundColor 
        }
      ]}>
        <Text style={styles.placeholderInitial}>{initial}</Text>
        {muscleGroup && (
          <Text style={styles.placeholderMuscle} numberOfLines={1}>
            {muscleGroup}
          </Text>
        )}
      </View>
    );
  };

  const ThumbnailWrapper = variant === 'interactive' && (showModal || onPress) 
    ? TouchableOpacity 
    : View;

  return (
    <>
      <ThumbnailWrapper 
        onPress={variant === 'interactive' ? handlePress : undefined}
        style={style}
        activeOpacity={0.8}
      >
        {renderThumbnail()}
      </ThumbnailWrapper>

      {/* GIF Modal (from complex version) */}
      {variant === 'interactive' && showModal && gifUrl && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={closeModal}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              {gifLoading && (
                <ActivityIndicator size="large" color="white" style={styles.loader} />
              )}
              
              <NetworkAwareImage
                source={{ uri: gifUrl }}
                style={styles.modalGif}
                resizeMode="contain"
                onLoad={handleGifLoad}
              />
              
              <Text style={styles.modalTitle}>{exerciseName}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  colorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
  },
  placeholderInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholderMuscle: {
    fontSize: 9,
    color: 'white',
    marginTop: 2,
    opacity: 0.9,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    padding: 10,
    zIndex: 1,
  },
  modalGif: {
    width: '100%',
    height: screenWidth * 0.9,
    maxHeight: 400,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
});

// Add display name for debugging
UnifiedExerciseThumbnail.displayName = 'UnifiedExerciseThumbnail';

export default UnifiedExerciseThumbnail;