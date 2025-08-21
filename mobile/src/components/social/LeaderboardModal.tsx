import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Challenge, LeaderboardEntry } from '../../types';
import socialService from '../../services/social.service';

interface LeaderboardModalProps {
  visible: boolean;
  challenge: Challenge | null;
  onClose: () => void;
  onUserPress?: (userId: string) => void;
}

export default function LeaderboardModal({
  visible,
  challenge,
  onClose,
  onUserPress,
}: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && challenge) {
      loadLeaderboard();
    }
  }, [visible, challenge]);

  const loadLeaderboard = async () => {
    if (!challenge) return;

    setIsLoading(true);
    try {
      const result = await socialService.getChallengeLeaderboard(challenge.challengeId);
      setLeaderboard(result.leaderboard);
      setUserRank(result.userRank);
    } catch (error) {
      Alert.alert('오류', '리더보드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
      default: return {};
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case '브론즈': return Colors.bronze;
      case '실버': return Colors.silver;
      case '골드': return Colors.gold;
      case '플래티넘': return Colors.platinum;
      case '다이아몬드': return Colors.diamond;
      case '챌린저': return Colors.challenger;
      default: return Colors.bronze;
    }
  };

  const getProgressPercentage = (progress: number, targetValue?: number) => {
    if (!targetValue) return 100;
    return Math.min((progress / targetValue) * 100, 100);
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rankIcon = getRankIcon(item.rank);
    const isCurrentUser = item.user.userId === 'current_user_id'; // You'd get this from auth context

    return (
      <TouchableOpacity
        style={[
          styles.leaderboardItem,
          getRankStyle(item.rank),
          isCurrentUser && styles.currentUserItem
        ]}
        onPress={() => onUserPress?.(item.user.userId)}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <Text style={styles.rankEmoji}>{rankIcon}</Text>
          ) : (
            <Text style={styles.rankNumber}>#{item.rank}</Text>
          )}
        </View>

        <Image
          source={{
            uri: item.user.profileImageUrl || 'https://via.placeholder.com/40'
          }}
          style={styles.userAvatar}
        />

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {item.user.username}
            </Text>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: getTierColor(item.user.userTier) }
              ]}
            >
              <Text style={styles.tierText}>{item.user.userTier}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {item.progress.toLocaleString()}
              {challenge?.targetValue && ` / ${challenge.targetValue.toLocaleString()}`}
            </Text>
            {challenge?.targetValue && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage(item.progress, challenge.targetValue)}%` }
                  ]}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.statusContainer}>
          {item.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.completedText}>완료</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!challenge) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리더보드</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Challenge Info */}
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeName}>{challenge.challengeName}</Text>
          <Text style={styles.participantsCount}>
            {challenge.participantsCount.toLocaleString()}명 참가 중
          </Text>
          {userRank && (
            <View style={styles.userRankInfo}>
              <Text style={styles.userRankText}>내 순위: #{userRank}</Text>
            </View>
          )}
        </View>

        {/* Leaderboard */}
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item, index) => `${item.user.userId}-${index}`}
          style={styles.leaderboardList}
          contentContainerStyle={styles.leaderboardContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                {isLoading ? '리더보드를 불러오는 중...' : '참가자가 없습니다.'}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 32,
  },
  challengeInfo: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    alignItems: 'center',
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  participantsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  userRankInfo: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardContent: {
    paddingVertical: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    marginVertical: 1,
  },
  firstPlace: {
    backgroundColor: Colors.gold + '10',
  },
  secondPlace: {
    backgroundColor: Colors.silver + '10',
  },
  thirdPlace: {
    backgroundColor: Colors.bronze + '10',
  },
  currentUserItem: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
});