import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Achievement, UserAchievement } from '../../types/achievements';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  progress?: number;
  onPress?: () => void;
  compact?: boolean;
}

const { width } = Dimensions.get('window');

const getRarityColors = (rarity: string): string[] => {
  switch (rarity) {
    case 'common': return ['#808080', '#555555'];
    case 'uncommon': return ['#4CAF50', '#388E3C'];
    case 'rare': return ['#2196F3', '#1976D2'];
    case 'epic': return ['#9C27B0', '#7B1FA2'];
    case 'legendary': return ['#FF9800', '#F57C00'];
    default: return [Colors.primary, '#FF4757'];
  }
};

const getRarityBorderColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#808080';
    case 'uncommon': return '#4CAF50';
    case 'rare': return '#2196F3';
    case 'epic': return '#9C27B0';
    case 'legendary': return '#FF9800';
    default: return Colors.border;
  }
};

export default function AchievementCard({
  achievement,
  userAchievement,
  progress = 0,
  onPress,
  compact = false,
}: AchievementCardProps) {
  const isUnlocked = userAchievement?.isCompleted || false;
  const rarityColors = getRarityColors(achievement.rarity);
  const rarityColor = getRarityBorderColor(achievement.rarity);
  const progressPercentage = progress || (userAchievement?.progress || 0) / (achievement.goal.target || 1) * 100;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { borderColor: rarityColor }]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.compactIcon}>
          <Text style={styles.iconText}>{achievement.icon}</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {achievement.title.ko}
          </Text>
          {!isUnlocked && (
            <View style={styles.compactProgressBar}>
              <View 
                style={[
                  styles.compactProgressFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
          )}
        </View>
        {isUnlocked && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: rarityColor },
        !isUnlocked && styles.lockedContainer
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.gradient,
          { backgroundColor: isUnlocked ? rarityColors[0] : '#2a2a2a' }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{achievement.icon}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
              {achievement.title.ko}
            </Text>
            <View style={styles.badges}>
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>{achievement.rewards.xp} XP</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.description, !isUnlocked && styles.lockedText]} numberOfLines={2}>
          {achievement.description.ko}
        </Text>

        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        )}

        {isUnlocked && userAchievement && (
          <View style={styles.unlockedInfo}>
            <Text style={styles.unlockedText}>
              🏆 달성: {new Date(userAchievement.unlockedAt).toLocaleDateString('ko-KR')}
            </Text>
            {userAchievement.repeatCount > 1 && (
              <Text style={styles.repeatText}>
                x{userAchievement.repeatCount} 반복 달성
              </Text>
            )}
          </View>
        )}

        {achievement.visibility === 'hidden' && !isUnlocked && (
          <View style={styles.hiddenBadge}>
            <Text style={styles.hiddenText}>히든</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
  },
  lockedContainer: {
    opacity: 0.7,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lockedText: {
    color: '#999999',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  xpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#DDDDDD',
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unlockedInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  unlockedText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  repeatText: {
    fontSize: 12,
    color: '#DDDDDD',
    marginTop: 4,
  },
  hiddenBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  hiddenText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});