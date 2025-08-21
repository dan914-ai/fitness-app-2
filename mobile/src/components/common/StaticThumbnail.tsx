import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import EXERCISE_DATABASE from '../../data/exerciseDatabase';
import { getExerciseGifAsset } from '../../constants/exerciseAssets';

interface StaticThumbnailProps {
  exerciseId: string;
  exerciseName?: string;
  muscleGroup?: string;
  style?: any;
  size?: number;
}

// Muscle group color mapping for fallback placeholders
const MUSCLE_COLORS: Record<string, string> = {
  '가슴': '#FF6B6B',     // Red - Chest
  '등': '#4ECDC4',       // Teal - Back  
  '어깨': '#FFE66D',     // Yellow - Shoulders
  '이두근': '#95E1D3',   // Mint - Biceps
  '삼두근': '#F38181',   // Pink - Triceps
  '대퇴사두근': '#AA96DA', // Purple - Quadriceps
  '햄스트링': '#FCBAD3', // Light Pink - Hamstrings
  '둔근': '#A8E6CF',     // Light Green - Glutes
  '복근': '#FFD93D',     // Gold - Abs
  '종아리': '#6BCB77',   // Green - Calves
  '전완근': '#FF8B94',   // Coral - Forearms
  '승모근': '#C39BD3',   // Light Purple - Traps
  '복합운동': '#F7DC6F', // Light Gold - Compound
  '유산소': '#85C1E9',   // Light Blue - Cardio
};

/**
 * StaticThumbnail - Uses bundled local assets for instant loading
 * Falls back to colored placeholders if no asset is found
 */
export default function StaticThumbnail({
  exerciseId,
  exerciseName,
  muscleGroup,
  style,
  size = 60,
}: StaticThumbnailProps) {
  // DEPRECATION WARNING
  React.useEffect(() => {
    console.warn(
      '⚠️ StaticThumbnail is DEPRECATED. Please use UnifiedExerciseThumbnail instead.\n' +
      `Usage: import UnifiedExerciseThumbnail from '../common/UnifiedExerciseThumbnail'\n` +
      `Found in component using exerciseId: ${exerciseId}`
    );
  }, []);

  const thumbnailData = useMemo(() => {
    // Try to get exercise data if not provided
    let exercise;
    if (!exerciseName || !muscleGroup) {
      exercise = EXERCISE_DATABASE.find(ex => ex.id.toString() === exerciseId);
    }

    const name = exerciseName || exercise?.name || 'Exercise';
    const muscle = muscleGroup || exercise?.muscleGroup || 'Unknown';
    
    // Use the auto-generated asset mapping
    const localAsset = getExerciseGifAsset(exerciseId);
    
    // Get fallback color and text
    const backgroundColor = MUSCLE_COLORS[muscle] || Colors.primary;
    const displayText = name.charAt(0).toUpperCase();
    
    return { 
      localAsset, 
      backgroundColor, 
      displayText,
      name,
      muscle
    };
  }, [exerciseId, exerciseName, muscleGroup]);

  // If we have a local asset, use it
  if (thumbnailData.localAsset) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Image
          source={thumbnailData.localAsset}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Fallback to colored placeholder
  return (
    <View style={[
      styles.container, 
      styles.placeholder,
      { 
        width: size, 
        height: size, 
        backgroundColor: thumbnailData.backgroundColor 
      }, 
      style
    ]}>
      <Text style={[
        styles.placeholderText,
        { fontSize: size * 0.4 }
      ]}>
        {thumbnailData.displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    elevation: 1, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  image: {
    borderRadius: 16,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});