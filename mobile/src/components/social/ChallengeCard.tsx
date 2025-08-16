import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Challenge } from '../../types';
import socialService from '../../services/social.service';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: (challengeId: string) => void;
  onJoinToggle?: (challengeId: string, isParticipating: boolean) => void;
}

const { width } = Dimensions.get('window');

export default function ChallengeCard({
  challenge,
  onPress,
  onJoinToggle,
}: ChallengeCardProps) {
  const [isParticipating, setIsParticipating] = useState(challenge.isParticipating);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = isParticipating
        ? await socialService.leaveChallenge(challenge.challengeId)
        : await socialService.joinChallenge(challenge.challengeId);
      
      if (result.success) {
        setIsParticipating(!isParticipating);
        onJoinToggle?.(challenge.challengeId, !isParticipating);
      } else {
        Alert.alert('알림', result.message);
      }
    } catch (error) {
      Alert.alert('오류', '챌린지 참여 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!challenge.targetValue || !challenge.userProgress) return 0;
    return Math.min((challenge.userProgress / challenge.targetValue) * 100, 100);
  };

  const getDaysRemaining = () => {
    const endDate = new Date(challenge.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'workout_count': return 'fitness';
      case 'calories_burned': return 'flame';
      case 'workout_duration': return 'time';
      case 'weight_loss': return 'trending-down';
      case 'steps': return 'walk';
      default: return 'trophy';
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'workout_count': return '운동 횟수';
      case 'calories_burned': return '칼로리 소모';
      case 'workout_duration': return '운동 시간';
      case 'weight_loss': return '체중 감량';
      case 'steps': return '걸음 수';
      default: return '챌린지';
    }
  };

  const isActive = getDaysRemaining() > 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isActive && styles.inactiveContainer
      ]}
      onPress={() => onPress?.(challenge.challengeId)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getChallengeTypeIcon(challenge.challengeType) as any}
              size={20}
              color={Colors.primary}
            />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.challengeName} numberOfLines={2}>
              {challenge.challengeName}
            </Text>
            <Text style={styles.challengeType}>
              {getChallengeTypeLabel(challenge.challengeType)}
            </Text>
          </View>
        </View>

        <View style={styles.rewardBadge}>
          <Ionicons name="star" size={12} color={Colors.warning} />
          <Text style={styles.rewardText}>{challenge.rewardPoints}P</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {challenge.description}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {challenge.participantsCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>참가자</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {getDaysRemaining()}
          </Text>
          <Text style={styles.statLabel}>남은 일</Text>
        </View>

        {challenge.userRank && (
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              #{challenge.userRank}
            </Text>
            <Text style={styles.statLabel}>순위</Text>
          </View>
        )}
      </View>

      {isParticipating && challenge.targetValue && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>진행률</Text>
            <Text style={styles.progressPercentage}>
              {getProgressPercentage().toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {challenge.userProgress?.toLocaleString() || 0} / {challenge.targetValue.toLocaleString()}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.joinButton,
            isParticipating && styles.participatingButton,
            !isActive && styles.disabledButton
          ]}
          onPress={handleJoinToggle}
          disabled={isLoading || !isActive}
        >
          <Ionicons
            name={isParticipating ? "checkmark-circle" : "add-circle"}
            size={16}
            color={
              !isActive 
                ? Colors.textLight
                : isParticipating 
                  ? Colors.success 
                  : Colors.surface
            }
            style={styles.buttonIcon}
          />
          <Text style={[
            styles.joinButtonText,
            isParticipating && styles.participatingButtonText,
            !isActive && styles.disabledButtonText
          ]}>
            {isLoading
              ? '처리중...'
              : !isActive
                ? '종료됨'
                : isParticipating
                  ? '참가중'
                  : '참가하기'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveContainer: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  challengeType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    marginRight: 24,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
  },
  joinButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participatingButton: {
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  disabledButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonIcon: {
    marginRight: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  participatingButtonText: {
    color: Colors.success,
  },
  disabledButtonText: {
    color: Colors.textLight,
  },
});