import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface FastThumbnailProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  size?: number;
  style?: any;
}

// Pure component - no async loading, no state changes
const FastThumbnail = memo(({
  exerciseId,
  exerciseName,
  muscleGroup,
  size = 60,
  style,
}: FastThumbnailProps) => {
  // Static muscle group colors
  const muscleColors: Record<string, string> = {
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
    '전완근': '#FF8B94',
    '승모근': '#C39BD3',
    '복합운동': '#F7DC6F',
    '유산소': '#85C1E9',
  };

  const backgroundColor = muscleColors[muscleGroup] || Colors.primary;
  
  // Get first two characters of exercise name (Korean or English)
  const getInitials = () => {
    if (!exerciseName) return '?';
    
    // For Korean names, take first two characters
    const cleanName = exerciseName.trim();
    if (cleanName.length >= 2) {
      return cleanName.substring(0, 2);
    }
    return cleanName.charAt(0) || '?';
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          backgroundColor 
        },
        style
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { fontSize: size * 0.3 }
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {getInitials()}
      </Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return prevProps.exerciseId === nextProps.exerciseId &&
         prevProps.exerciseName === nextProps.exerciseName &&
         prevProps.muscleGroup === nextProps.muscleGroup &&
         prevProps.size === nextProps.size;
});

FastThumbnail.displayName = 'FastThumbnail';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FastThumbnail;