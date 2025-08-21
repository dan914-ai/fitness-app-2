import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { UserAchievements, AchievementData } from '../../types';
import analyticsService from '../../services/analytics.service';
import { StatCard } from '../../components/analytics';
import { ProgressCircle } from '../../components/analytics';

export default function AchievementsScreen({ navigation }: any) {
  const [achievementsData, setAchievementsData] = useState<UserAchievements | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getUserAchievements();
      setAchievementsData(data);
    } catch (error) {
      // Error loading achievements
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !achievementsData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>업적을 불러오는 중...</Text>
      </View>
    );
  }

  const getCategories = () => {
    if (!achievementsData) return ['전체'];
    return ['전체', ...Object.keys(achievementsData.achievementsByCategory)];
  };

  const getFilteredAchievements = () => {
    if (!achievementsData) return [];
    
    if (selectedCategory === '전체') {
      return achievementsData.achievements;
    }
    
    return achievementsData.achievementsByCategory[selectedCategory] || [];
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>업적</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSummaryCards = () => {
    if (!achievementsData) return null;

    const { summary } = achievementsData || {};

    if (!summary) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>업적 개요</Text>
        <View style={styles.cardGrid}>
          <View style={styles.cardRow}>
            <StatCard
              title="획득 업적"
              value={summary.totalEarned || 0}
              subtitle={`/ ${summary.totalAvailable || 0}개`}
              icon="emoji-events"
            />
            <StatCard
              title="획득 포인트"
              value={(summary.totalPoints || 0).toLocaleString()}
              subtitle="포인트"
              icon="stars"
            />
          </View>
          <View style={styles.cardRow}>
            <StatCard
              title="달성률"
              value={`${(summary.completionPercentage || 0).toFixed(1)}%`}
              subtitle="전체 업적"
              icon="trending-up"
            />
            <StatCard
              title="최근 업적"
              value={summary.recentAchievements?.length || 0}
              subtitle="이번 달"
              icon="new-releases"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderProgressOverview = () => {
    if (!achievementsData) return null;

    const { summary, achievementsByCategory } = achievementsData;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>카테고리별 진행</Text>
        <View style={styles.progressGrid}>
          {Object.entries(achievementsByCategory).map(([category, achievements]) => {
            const earned = achievements.filter(a => a.isEarned).length;
            const total = achievements.length;
            const percentage = total > 0 ? (earned / total) * 100 : 0;
            
            return (
              <View key={category} style={styles.progressItem}>
                <ProgressCircle
                  progress={percentage}
                  size={80}
                  text={`${earned}`}
                  subText={category}
                  color={getCategoryColor(category)}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCategorySelector = () => {
    const categories = getCategories();

    return (
      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categorySelector}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAchievementsList = () => {
    const filteredAchievements = getFilteredAchievements();

    if (filteredAchievements.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.emptyState}>
            <Icon name="emoji-events" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>업적이 없습니다.</Text>
          </View>
        </View>
      );
    }

    const renderAchievementItem = ({ item }: { item: AchievementData }) => (
      <View style={[styles.achievementItem, item.isEarned && styles.achievementItemEarned]}>
        <View style={styles.achievementIcon}>
          {item.isEarned ? (
            <Icon name="emoji-events" size={32} color={Colors.warning} />
          ) : (
            <Icon name="radio-button-unchecked" size={32} color={Colors.textLight} />
          )}
        </View>
        
        <View style={styles.achievementContent}>
          <View style={styles.achievementHeader}>
            <Text style={[styles.achievementName, item.isEarned && styles.achievementNameEarned]}>
              {item.achievementName}
            </Text>
            <View style={styles.achievementPoints}>
              <Icon name="stars" size={16} color={Colors.warning} />
              <Text style={styles.pointsText}>{item.points}</Text>
            </View>
          </View>
          
          <Text style={styles.achievementDescription}>{item.description}</Text>
          
          {!item.isEarned && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.progressPercentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {item.currentProgress} / {item.requiredValue} ({item.progressPercentage.toFixed(0)}%)
              </Text>
            </View>
          )}
          
          {item.isEarned && item.earnedAt && (
            <Text style={styles.earnedDate}>
              {analyticsService.formatDate(item.earnedAt, 'long')} 달성
            </Text>
          )}
        </View>
      </View>
    );

    // Sort achievements: earned first, then by progress percentage
    const sortedAchievements = [...filteredAchievements].sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      if (!a.isEarned && !b.isEarned) {
        return b.progressPercentage - a.progressPercentage;
      }
      return 0;
    });

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === '전체' ? '모든 업적' : `${selectedCategory} 업적`}
        </Text>
        <FlatList
          data={sortedAchievements}
          renderItem={renderAchievementItem}
          keyExtractor={(item) => item.id || item.achievementId}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderRecentAchievements = () => {
    if (!achievementsData || !achievementsData.summary || !achievementsData.summary.recentAchievements || achievementsData.summary.recentAchievements.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 달성한 업적</Text>
        {achievementsData.summary.recentAchievements.map((achievement) => (
          <View key={achievement.id || achievement.achievementId} style={styles.recentAchievementItem}>
            <Icon name="emoji-events" size={24} color={Colors.warning} />
            <View style={styles.recentAchievementContent}>
              <Text style={styles.recentAchievementName}>
                {achievement.achievementName}
              </Text>
              <Text style={styles.recentAchievementDate}>
                {`${analyticsService.formatDate(achievement.earnedAt)} • ${achievement.points} 포인트`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMotivation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>동기부여</Text>
      <View style={styles.motivationCard}>
        <Icon name="psychology" size={24} color={Colors.accent} />
        <View style={styles.motivationContent}>
          <Text style={styles.motivationTitle}>꾸준한 노력이 성과를 만듭니다</Text>
          <Text style={styles.motivationDescription}>
            작은 목표부터 차근차근 달성해보세요. 매일의 운동이 큰 변화를 만들어냅니다.
          </Text>
        </View>
      </View>
      
      {achievementsData && achievementsData.summary && achievementsData.summary.completionPercentage < 50 && (
        <View style={styles.motivationCard}>
          <Icon name="flag" size={24} color={Colors.primary} />
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>다음 목표를 설정해보세요</Text>
            <Text style={styles.motivationDescription}>
              아직 달성하지 못한 업적들을 확인하고 새로운 목표를 세워보세요.
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      '운동': Colors.primary,
      '소셜': Colors.secondary,
      '일관성': Colors.success,
      '도전': Colors.warning,
      '성취': Colors.accent,
    };
    return colors[category] || Colors.textSecondary;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderHeader()}
      {renderSummaryCards()}
      {renderProgressOverview()}
      {renderRecentAchievements()}
      {renderCategorySelector()}
      {renderAchievementsList()}
      {renderMotivation()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  cardGrid: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  progressItem: {
    alignItems: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  achievementItemEarned: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  achievementIcon: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  achievementNameEarned: {
    color: Colors.warning,
  },
  achievementPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  earnedDate: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
    marginTop: 4,
  },
  recentAchievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  recentAchievementContent: {
    flex: 1,
    marginLeft: 12,
  },
  recentAchievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  recentAchievementDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  motivationContent: {
    flex: 1,
    marginLeft: 12,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  motivationDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});