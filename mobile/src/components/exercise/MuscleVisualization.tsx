import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface MuscleVisualizationProps {
  targetMuscles: string[];
  secondaryMuscles?: string[];
  showLabels?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

// Muscle image URLs - Using placeholders until proper assets are available
// const MUSCLE_IMAGES = {
//   front: {
//     base: require('../../assets/muscles/front-base.png'), // Base body image
//     chest: require('../../assets/muscles/front-chest.png'),
//     shoulders: require('../../assets/muscles/front-shoulders.png'),
//     biceps: require('../../assets/muscles/front-biceps.png'),
//     abs: require('../../assets/muscles/front-abs.png'),
//     quadriceps: require('../../assets/muscles/front-quadriceps.png'),
//     forearms: require('../../assets/muscles/front-forearms.png'),
//   },
//   back: {
//     base: require('../../assets/muscles/back-base.png'), // Base body image
//     traps: require('../../assets/muscles/back-traps.png'),
//     lats: require('../../assets/muscles/back-lats.png'),
//     triceps: require('../../assets/muscles/back-triceps.png'),
//     lowerBack: require('../../assets/muscles/back-lower.png'),
//     glutes: require('../../assets/muscles/back-glutes.png'),
//     hamstrings: require('../../assets/muscles/back-hamstrings.png'),
//     calves: require('../../assets/muscles/back-calves.png'),
//   }
// };

// Temporary placeholder using data URIs (replace with local assets)
// This is a 1x1 transparent pixel
const TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const TEMP_MUSCLE_IMAGES = {
  front: TRANSPARENT_PIXEL,
  back: TRANSPARENT_PIXEL,
};

const muscleGroupMap: { [key: string]: { front?: string[], back?: string[] } } = {
  '가슴': { front: ['chest'] },
  '어깨': { front: ['shoulders'], back: ['shoulders'] },
  '등': { back: ['lats', 'traps'] },
  '하체': { front: ['quadriceps'], back: ['hamstrings', 'glutes', 'calves'] },
  '이두': { front: ['biceps'] },
  '삼두': { back: ['triceps'] },
  '복근': { front: ['abs'] },
  '전완': { front: ['forearms'] },
  '허리': { back: ['lowerBack'] },
};

export default function MuscleVisualization({ 
  targetMuscles, 
  secondaryMuscles = [], 
  showLabels = false 
}: MuscleVisualizationProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  const getHighlightedMuscles = (muscleGroups: string[], side: 'front' | 'back'): string[] => {
    const highlighted: string[] = [];
    muscleGroups.forEach(group => {
      const mappedMuscles = muscleGroupMap[group];
      if (mappedMuscles && mappedMuscles[side]) {
        highlighted.push(...mappedMuscles[side]);
      }
    });
    return highlighted;
  };

  const primaryHighlighted = getHighlightedMuscles(targetMuscles, viewSide);
  const secondaryHighlighted = getHighlightedMuscles(secondaryMuscles, viewSide);

  const renderMuscleOverlay = (muscleId: string, isPrimary: boolean) => {
    const opacity = isPrimary ? 0.8 : 0.5;
    const color = isPrimary ? Colors.error : Colors.warning;
    
    // For now, using colored overlay divs positioned over the muscle areas
    // In production, you would have separate transparent PNG images for each muscle
    return (
      <View
        key={muscleId}
        style={[
          styles.muscleOverlay,
          {
            backgroundColor: color,
            opacity: opacity,
          },
          // Add specific positioning for each muscle
          getMusclePosition(muscleId, viewSide),
        ]}
      />
    );
  };

  // Temporary positioning function - replace with actual muscle positions
  const getMusclePosition = (muscleId: string, side: 'front' | 'back') => {
    const positions: any = {
      front: {
        chest: { top: '25%', left: '35%', width: '30%', height: '15%' },
        shoulders: { top: '20%', left: '25%', width: '50%', height: '10%' },
        biceps: { top: '30%', left: '20%', width: '15%', height: '20%' },
        abs: { top: '40%', left: '35%', width: '30%', height: '20%' },
        quadriceps: { top: '60%', left: '30%', width: '40%', height: '20%' },
        forearms: { top: '50%', left: '15%', width: '15%', height: '15%' },
      },
      back: {
        traps: { top: '15%', left: '30%', width: '40%', height: '15%' },
        lats: { top: '25%', left: '25%', width: '50%', height: '25%' },
        triceps: { top: '30%', left: '20%', width: '15%', height: '20%' },
        lowerBack: { top: '45%', left: '35%', width: '30%', height: '15%' },
        glutes: { top: '55%', left: '30%', width: '40%', height: '10%' },
        hamstrings: { top: '65%', left: '30%', width: '40%', height: '20%' },
        calves: { top: '80%', left: '35%', width: '30%', height: '15%' },
      }
    };
    
    return positions[side]?.[muscleId] || {};
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewSide === 'front' && styles.toggleButtonActive]}
          onPress={() => setViewSide('front')}
        >
          <Text style={[styles.toggleText, viewSide === 'front' && styles.toggleTextActive]}>
            앞면
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewSide === 'back' && styles.toggleButtonActive]}
          onPress={() => setViewSide('back')}
        >
          <Text style={[styles.toggleText, viewSide === 'back' && styles.toggleTextActive]}>
            뒷면
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bodyContainer}>
        {/* Base body image */}
        <Image
          source={{ uri: TEMP_MUSCLE_IMAGES[viewSide] }}
          style={styles.bodyImage}
          resizeMode="contain"
        />
        
        {/* Muscle overlays */}
        <View style={styles.overlayContainer}>
          {primaryHighlighted.map(muscleId => renderMuscleOverlay(muscleId, true)).filter(Boolean)}
          {secondaryHighlighted.map(muscleId => renderMuscleOverlay(muscleId, false)).filter(Boolean)}
        </View>

        {/* Labels */}
        {showLabels && (
          <View style={styles.labelsContainer}>
            {primaryHighlighted.map(muscleId => (
              <Text
                key={`label-${muscleId}`}
                style={[
                  styles.muscleLabel,
                  getMusclePosition(muscleId, viewSide),
                  { color: Colors.error }
                ]}
              >
                {getMuscleLabel(muscleId)}
              </Text>
            )).filter(Boolean)}
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>주요 근육</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>보조 근육</Text>
        </View>
      </View>
    </View>
  );
}

const getMuscleLabel = (muscleId: string): string => {
  const labels: { [key: string]: string } = {
    chest: '가슴',
    shoulders: '어깨',
    biceps: '이두근',
    abs: '복근',
    quadriceps: '대퇴사두근',
    forearms: '전완근',
    traps: '승모근',
    lats: '광배근',
    triceps: '삼두근',
    lowerBack: '허리',
    glutes: '둔근',
    hamstrings: '햄스트링',
    calves: '종아리',
  };
  return labels[muscleId] || muscleId;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  bodyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    width: screenWidth * 0.8,
    height: screenWidth * 1.2,
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },
  muscleOverlay: {
    position: 'absolute',
    borderRadius: 8,
  },
  labelsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },
  muscleLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});