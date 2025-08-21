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
import { staticThumbnails } from '../../constants/staticThumbnails';
import NetworkAwareImage from './NetworkAwareImage';

interface ExerciseThumbnailProps {
  exerciseId: string | number;
  exerciseName: string;
  muscleGroup?: string;
  gifUrl?: string; // Optional Supabase GIF URL for detail view
  size?: number;
  style?: any;
  showModal?: boolean; // Whether to allow opening modal with GIF
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Unified thumbnail component for all exercise displays
 * 
 * RULES:
 * 1. ALWAYS use local static JPEG for list views (instant, no network)
 * 2. ONLY load GIF when user explicitly taps to see animation
 * 3. Fall back to colored placeholder if no thumbnail available
 * 
 * This replaces: StaticThumbnail, FastThumbnail, OptimizedThumbnail, 
 * HybridThumbnail, StaticGifThumbnail, InstantThumbnail
 */
const ExerciseThumbnail = memo(({
  exerciseId,
  exerciseName,
  muscleGroup,
  gifUrl,
  size = 60,
  style,
  showModal = true,
}: ExerciseThumbnailProps) => {
  // DEPRECATION WARNING
  React.useEffect(() => {
    console.warn(
      '⚠️ ExerciseThumbnail in common/ is DEPRECATED. Please use UnifiedExerciseThumbnail instead.\n' +
      `Usage: import UnifiedExerciseThumbnail from '../common/UnifiedExerciseThumbnail'\n` +
      `Found in component using exerciseId: ${exerciseId}, exerciseName: ${exerciseName}`
    );
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [gifLoading, setGifLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);
  
  // Get local thumbnail from static mapping
  const thumbnail = staticThumbnails[exerciseId.toString()];
  
  const handlePress = useCallback(() => {
    if (showModal && gifUrl) {
      setModalVisible(true);
      setGifLoading(true);
    }
  }, [gifUrl, showModal]);
  
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);
  
  const handleGifLoad = useCallback(() => {
    setGifLoading(false);
  }, []);

  const handleThumbnailError = useCallback(() => {
    setThumbnailError(true);
  }, []);

  // Fallback colors for muscle groups
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
      '복근': '#FFD93D',
      '종아리': '#6BCB77',
    };
    return colors[muscle || ''] || Colors.primary;
  };

  // Render thumbnail or fallback
  const renderThumbnail = () => {
    if (thumbnail && !thumbnailError) {
      // Use local static JPEG
      return (
        <Image
          source={thumbnail}
          style={styles.thumbnail}
          resizeMode="cover"
          fadeDuration={0} // Instant display
          onError={handleThumbnailError}
        />
      );
    } else {
      // Fallback to colored placeholder
      const backgroundColor = getMuscleColor(muscleGroup);
      const initial = exerciseName?.charAt(0)?.toUpperCase() || '?';
      
      return (
        <View style={[styles.placeholder, { backgroundColor }]}>
          <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
            {initial}
          </Text>
        </View>
      );
    }
  };

  return (
    <>
      {/* Thumbnail - Always local, instant loading */}
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={showModal && gifUrl ? 0.7 : 1}
        disabled={!showModal || !gifUrl}
      >
        <View style={[styles.container, { width: size, height: size }, style]}>
          {renderThumbnail()}
        </View>
      </TouchableOpacity>

      {/* GIF Modal - Only loads when opened */}
      {showModal && gifUrl && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={closeModal} activeOpacity={1}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{exerciseName}</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Animated GIF from Supabase with Network Awareness */}
              <View style={styles.gifContainer}>
                <NetworkAwareImage
                  source={{ uri: gifUrl }}
                  exerciseId={exerciseId.toString()}
                  exerciseName={exerciseName}
                  style={styles.gif}
                  resizeMode="contain"
                  showRetryButton={true}
                  showNetworkStatus={true}
                  onLoad={handleGifLoad}
                  onFallbackUsed={(fallbackType) => {
                    console.log(`GIF fallback used for ${exerciseId}: ${fallbackType}`);
                  }}
                />
              </View>
              
              {/* Info */}
              <View style={styles.modalInfo}>
                <Text style={styles.muscleGroupText}>{muscleGroup || '전신'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  gifContainer: {
    width: '100%',
    height: screenWidth * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  muscleGroupText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default ExerciseThumbnail;