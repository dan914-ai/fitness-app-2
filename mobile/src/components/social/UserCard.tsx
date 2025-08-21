import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { User } from '../../types';
import socialService from '../../services/social.service';

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  onPress?: (userId: string) => void;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

export default function UserCard({
  user,
  showFollowButton = true,
  onPress,
  onFollowToggle,
}: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = isFollowing
        ? await socialService.unfollowUser(user.userId)
        : await socialService.followUser(user.userId);
      
      setIsFollowing(result.isFollowing);
      onFollowToggle?.(user.userId, result.isFollowing);
    } catch (error) {
      Alert.alert('오류', '팔로우 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(user.userId)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Image
          source={{
            uri: user.profileImageUrl || 'https://via.placeholder.com/50'
          }}
          style={styles.avatar}
        />
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{user.username}</Text>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: getTierColor(user.userTier) }
              ]}
            >
              <Text style={styles.tierText}>{user.userTier}</Text>
            </View>
          </View>
          
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.followersCount?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>팔로워</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.workoutCount?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>운동</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user.totalPoints.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>포인트</Text>
            </View>
          </View>
        </View>
      </View>

      {showFollowButton && (
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton
          ]}
          onPress={handleFollowToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={[
              styles.followText,
              isFollowing && styles.followingText
            ]}>
              처리중...
            </Text>
          ) : (
            <>
              <Ionicons
                name={isFollowing ? "person-remove" : "person-add"}
                size={16}
                color={isFollowing ? Colors.textSecondary : Colors.surface}
                style={styles.followIcon}
              />
              <Text style={[
                styles.followText,
                isFollowing && styles.followingText
              ]}>
                {isFollowing ? '팔로잉' : '팔로우'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followIcon: {
    marginRight: 4,
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  followingText: {
    color: Colors.textSecondary,
  },
});