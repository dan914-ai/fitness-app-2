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
import { SocialPost } from '../../types';
import socialService from '../../services/social.service';

interface FeedPostProps {
  post: SocialPost;
  onLike?: (postId: string, isLiked: boolean, likesCount: number) => void;
  onComment?: (post: SocialPost) => void;
  onUserPress?: (userId: string) => void;
  onWorkoutPress?: (workoutId: string) => void;
}

export default function FeedPost({
  post,
  onLike,
  onComment,
  onUserPress,
  onWorkoutPress,
}: FeedPostProps) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await socialService.likePost(post.postId);
      onLike?.(post.postId, result.isLiked, result.likesCount);
    } catch (error) {
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;
    
    return postTime.toLocaleDateString('ko-KR');
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress?.(post.user.userId)}
        >
          <Image
            source={{
              uri: post.user.profileImageUrl || 'https://via.placeholder.com/40'
            }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{post.user.username}</Text>
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: getTierColor(post.user.userTier) }
                ]}
              >
                <Text style={styles.tierText}>{post.user.userTier}</Text>
              </View>
            </View>
            <Text style={styles.timestamp}>{formatTime(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.contentText}>{post.content}</Text>
        
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {post.workout && (
          <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => post.workoutId && onWorkoutPress?.(post.workoutId)}
          >
            <View style={styles.workoutHeader}>
              <Ionicons name="fitness" size={20} color={Colors.primary} />
              <Text style={styles.workoutTitle}>운동 기록</Text>
            </View>
            <Text style={styles.workoutDetails}>
              {post.workout.totalDuration ? `${Math.floor(post.workout.totalDuration / 60)}분` : ''}
              {post.workout.totalCalories ? ` • ${post.workout.totalCalories}kcal` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, post.isLiked && styles.likedButton]}
          onPress={handleLike}
          disabled={isLiking}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={post.isLiked ? Colors.error : Colors.textSecondary}
          />
          <Text style={[
            styles.actionText,
            post.isLiked && styles.likedText
          ]}>
            {post.likesCount > 0 ? post.likesCount : '좋아요'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={Colors.textSecondary}
          />
          <Text style={styles.actionText}>
            {post.commentsCount > 0 ? post.commentsCount : '댓글'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="share-outline"
            size={20}
            color={Colors.textSecondary}
          />
          <Text style={styles.actionText}>공유</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginVertical: 4,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  workoutDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  likedButton: {
    backgroundColor: Colors.error + '10',
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  likedText: {
    color: Colors.error,
  },
});