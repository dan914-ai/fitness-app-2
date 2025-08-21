import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Basic skeleton component
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style 
}: SkeletonProps) {
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
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.border,
          opacity: animatedOpacity,
        },
        style,
      ]}
    />
  );
}

// Home screen skeleton loader
export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* User tier section */}
      <View style={styles.section}>
        <Skeleton width="40%" height={24} style={styles.marginBottom} />
        <View style={styles.row}>
          <Skeleton width={60} height={60} borderRadius={30} />
          <View style={styles.flex}>
            <Skeleton width="60%" height={18} style={styles.marginBottom} />
            <Skeleton width="80%" height={14} />
          </View>
        </View>
      </View>

      {/* My Routines section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Skeleton width="30%" height={20} />
          <Skeleton width={80} height={32} borderRadius={16} />
        </View>
        
        <View style={styles.routineGrid}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.routineCard}>
              <Skeleton width={40} height={40} borderRadius={20} style={styles.marginBottom} />
              <Skeleton width="80%" height={16} style={styles.marginBottom} />
              <Skeleton width="60%" height={12} style={styles.marginBottom} />
              <Skeleton width="90%" height={12} />
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Skeleton width="40%" height={20} style={styles.marginBottom} />
        <View style={styles.actionGrid}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={styles.actionCard}>
              <Skeleton width={24} height={24} style={styles.marginBottom} />
              <Skeleton width="80%" height={12} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Routine list skeleton loader
export function RoutineListSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={styles.flex}>
            <Skeleton width="70%" height={18} style={styles.marginBottom} />
            <Skeleton width="50%" height={14} style={styles.marginBottom} />
            <Skeleton width="80%" height={12} />
          </View>
          <Skeleton width={30} height={30} borderRadius={15} />
        </View>
      ))}
    </View>
  );
}

// Workout history skeleton loader
export function WorkoutHistorySkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.workoutCard}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Skeleton width="60%" height={18} style={styles.marginBottom} />
              <Skeleton width="40%" height={14} />
            </View>
            <Skeleton width={60} height={24} borderRadius={12} />
          </View>
          
          <View style={styles.exerciseList}>
            {[1, 2, 3].map(j => (
              <View key={j} style={styles.exerciseItem}>
                <Skeleton width="50%" height={14} />
                <Skeleton width="30%" height={14} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// Stats screen skeleton loader
export function StatsScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Summary cards */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.statCard}>
            <Skeleton width="80%" height={32} style={styles.marginBottom} />
            <Skeleton width="60%" height={14} />
          </View>
        ))}
      </View>

      {/* Chart section */}
      <View style={styles.section}>
        <Skeleton width="50%" height={20} style={styles.marginBottom} />
        <Skeleton width="100%" height={200} borderRadius={8} />
      </View>

      {/* Progress section */}
      <View style={styles.section}>
        <Skeleton width="40%" height={20} style={styles.marginBottom} />
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.progressItem}>
            <Skeleton width="40%" height={16} />
            <View style={styles.progressBar}>
              <Skeleton width="100%" height={8} borderRadius={4} />
            </View>
            <Skeleton width="20%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Exercise tracking skeleton loader
export function ExerciseTrackingSkeleton() {
  return (
    <View style={styles.container}>
      {/* Exercise header */}
      <View style={styles.section}>
        <Skeleton width="60%" height={24} style={styles.marginBottom} />
        <Skeleton width="40%" height={16} />
      </View>

      {/* Sets */}
      <View style={styles.section}>
        <Skeleton width="30%" height={18} style={styles.marginBottom} />
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.setRow}>
            <Skeleton width={30} height={30} borderRadius={15} />
            <Skeleton width={60} height={40} borderRadius={8} />
            <Skeleton width={60} height={40} borderRadius={8} />
            <Skeleton width={80} height={32} borderRadius={16} />
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <Skeleton width={100} height={44} borderRadius={22} />
        <Skeleton width={120} height={44} borderRadius={22} />
      </View>
    </View>
  );
}

// Social feed skeleton loader
export function SocialFeedSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.socialCard}>
          <View style={styles.row}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={styles.flex}>
              <Skeleton width="50%" height={16} style={styles.marginBottom} />
              <Skeleton width="30%" height={12} />
            </View>
          </View>
          
          <Skeleton width="100%" height={150} borderRadius={8} style={styles.marginVertical} />
          
          <View style={styles.row}>
            <Skeleton width={60} height={32} borderRadius={16} />
            <Skeleton width={80} height={32} borderRadius={16} />
            <Skeleton width={70} height={32} borderRadius={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  marginBottom: {
    marginBottom: 8,
  },
  marginVertical: {
    marginVertical: 12,
  },
  routineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  routineCard: {
    width: (width - 48) / 2,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    padding: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
  },
  workoutCard: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
  },
  exerciseList: {
    marginTop: 12,
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  socialCard: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
  },
});