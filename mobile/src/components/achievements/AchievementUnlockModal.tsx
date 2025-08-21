import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Achievement } from '../../types/achievements';

interface AchievementUnlockModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
  onShare?: () => void;
}

const { width, height } = Dimensions.get('window');

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

export default function AchievementUnlockModal({
  visible,
  achievement,
  onClose,
  onShare,
}: AchievementUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible, achievement]);

  if (!achievement) return null;

  const rarityColors = getRarityColors(achievement.rarity);
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Celebration Animation Background */}
          <View style={styles.celebrationContainer}>
            <Animated.Text
              style={[
                styles.celebrationEmoji,
                { transform: [{ rotate: spin }] },
              ]}
            >
              ✨
            </Animated.Text>
          </View>

          {/* Achievement Badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: rarityColors[0] }
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{achievement.icon}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.unlockTitle}>업적 달성!</Text>
          
          {/* Achievement Name */}
          <Text style={styles.achievementTitle}>
            {achievement.title.ko}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {achievement.description.ko}
          </Text>

          {/* Rewards */}
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>⭐</Text>
              <Text style={styles.rewardText}>{achievement.rewards.xp} XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>💎</Text>
              <Text style={styles.rewardText}>{achievement.rewards.points} 포인트</Text>
            </View>
          </View>

          {/* Rarity */}
          <View style={styles.badgeInfo}>
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {onShare && (
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={onShare}
              >
                <Text style={styles.shareButtonText}>공유하기</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    width: width * 0.85,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  celebrationContainer: {
    position: 'absolute',
    top: -30,
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 60,
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
  },
  unlockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  badgeInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    backgroundColor: Colors.primary,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});