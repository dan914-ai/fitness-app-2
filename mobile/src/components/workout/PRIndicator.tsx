import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { prService, PersonalRecord } from '../../services/pr.service';

interface PRIndicatorProps {
  exerciseId: string;
  currentWeight: number;
  style?: any;
}

export default function PRIndicator({ exerciseId, currentWeight, style }: PRIndicatorProps) {
  const [pr, setPR] = useState<PersonalRecord | null>(null);
  const [closenessPercentage, setClosenessPercentage] = useState(0);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadPR();
  }, [exerciseId]);

  useEffect(() => {
    if (currentWeight > 0 && pr) {
      const percentage = (currentWeight / pr.weight) * 100;
      setClosenessPercentage(percentage);
      
      // Animate when close to PR
      if (percentage >= 90) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [currentWeight, pr]);

  const loadPR = async () => {
    const personalRecord = await prService.getPR(exerciseId);
    setPR(personalRecord);
  };

  if (!pr || currentWeight <= 0) return null;

  const getIndicatorColor = () => {
    if (closenessPercentage >= 100) return '#FFD700'; // Gold for new PR
    if (closenessPercentage >= 95) return Colors.error; // Red when very close
    if (closenessPercentage >= 90) return Colors.warning; // Orange when close
    return Colors.primary;
  };

  const getIndicatorText = () => {
    if (closenessPercentage >= 100) {
      const improvement = ((currentWeight - pr.weight) / pr.weight * 100).toFixed(1);
      return `🏆 새 PR! (+${improvement}%)`;
    }
    if (closenessPercentage >= 95) return `🔥 PR 임박! (${closenessPercentage.toFixed(0)}%)`;
    if (closenessPercentage >= 90) return `💪 PR 근접 (${closenessPercentage.toFixed(0)}%)`;
    return null;
  };

  const indicatorText = getIndicatorText();
  if (!indicatorText) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
        style
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]}>
        <Icon name="trending-up" size={16} color="#FFFFFF" />
        <Text style={styles.text}>{indicatorText}</Text>
      </View>
      <Text style={styles.prInfo}>
        현재 PR: {pr.weight}kg × {pr.reps}회
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  prInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});