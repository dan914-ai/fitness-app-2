import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { prService, PersonalRecord } from '../../services/pr.service';
import { getThumbnail } from '../../constants/thumbnailMapping';
import { LinearGradient } from 'expo-linear-gradient';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  requirement: number;
  current: number;
}

export default function PRStatsScreen() {
  const navigation = useNavigation();
  const [prs, setPRs] = useState<PersonalRecord[]>([]);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'recent' | 'achievements'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allPRs = await prService.getAllPRs();
    const recent = await prService.getRecentPRs(30);
    setPRs(allPRs);
    setRecentPRs(recent);
    
    // Generate achievements based on PRs
    generateAchievements(allPRs);
  };

  const generateAchievements = (allPRs: PersonalRecord[]) => {
    const maxWeight = Math.max(...allPRs.map(pr => pr.weight), 0);
    const totalPRs = allPRs.length;
    const totalVolume = allPRs.reduce((sum, pr) => sum + pr.volume, 0);
    
    const achievementsList: Achievement[] = [
      {
        id: 'first_pr',
        title: '첫 PR 달성',
        description: '첫 번째 개인 기록을 세웠습니다',
        icon: '🎯',
        unlocked: totalPRs > 0,
        requirement: 1,
        current: totalPRs,
      },
      {
        id: 'pr_collector',
        title: 'PR 수집가',
        description: '10개의 다른 운동에서 PR 달성',
        icon: '📈',
        unlocked: totalPRs >= 10,
        requirement: 10,
        current: totalPRs,
      },
      {
        id: 'pr_master',
        title: 'PR 마스터',
        description: '25개의 다른 운동에서 PR 달성',
        icon: '👑',
        unlocked: totalPRs >= 25,
        requirement: 25,
        current: totalPRs,
      },
      {
        id: 'century_club',
        title: '센츄리 클럽',
        description: '100kg 이상 들어올리기',
        icon: '💯',
        unlocked: maxWeight >= 100,
        requirement: 100,
        current: maxWeight,
      },
      {
        id: 'beast_mode',
        title: '비스트 모드',
        description: '140kg 이상 들어올리기',
        icon: '🦾',
        unlocked: maxWeight >= 140,
        requirement: 140,
        current: maxWeight,
      },
      {
        id: 'titan',
        title: '타이탄',
        description: '180kg 이상 들어올리기',
        icon: '⚡',
        unlocked: maxWeight >= 180,
        requirement: 180,
        current: maxWeight,
      },
      {
        id: 'legend',
        title: '전설',
        description: '200kg 이상 들어올리기',
        icon: '🏆',
        unlocked: maxWeight >= 200,
        requirement: 200,
        current: maxWeight,
      },
      {
        id: 'volume_king',
        title: '볼륨 킹',
        description: '총 볼륨 100,000kg 달성',
        icon: '📊',
        unlocked: totalVolume >= 100000,
        requirement: 100000,
        current: totalVolume,
      },
    ];
    
    setAchievements(achievementsList);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderPRItem = (pr: PersonalRecord) => (
    <TouchableOpacity key={pr.exerciseId} style={styles.prCard}>
      <Image 
        source={getThumbnail(pr.exerciseName)} 
        style={styles.thumbnail}
      />
      <View style={styles.prInfo}>
        <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
        <View style={styles.prStats}>
          <View style={styles.prStat}>
            <Icon name="fitness-center" size={16} color={Colors.primary} />
            <Text style={styles.prStatText}>{pr.weight}kg</Text>
          </View>
          <View style={styles.prStat}>
            <Icon name="repeat" size={16} color={Colors.warning} />
            <Text style={styles.prStatText}>{pr.reps}회</Text>
          </View>
          <View style={styles.prStat}>
            <Icon name="trending-up" size={16} color={Colors.success} />
            <Text style={styles.prStatText}>{pr.volume.toLocaleString()}kg</Text>
          </View>
        </View>
        <Text style={styles.prDate}>{formatDate(pr.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAchievement = (achievement: Achievement) => (
    <View 
      key={achievement.id} 
      style={[
        styles.achievementCard,
        achievement.unlocked && styles.achievementUnlocked
      ]}
    >
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementInfo}>
        <Text style={[
          styles.achievementTitle,
          achievement.unlocked && styles.achievementTitleUnlocked
        ]}>
          {achievement.title}
        </Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%`,
                backgroundColor: achievement.unlocked ? Colors.success : Colors.primary
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.current}/{achievement.requirement}
        </Text>
      </View>
      {achievement.unlocked && (
        <Icon name="check-circle" size={24} color={Colors.success} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인 기록 & 업적</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Summary */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.summaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{prs.length}</Text>
            <Text style={styles.summaryLabel}>총 PR</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{recentPRs.length}</Text>
            <Text style={styles.summaryLabel}>최근 30일</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {achievements.filter(a => a.unlocked).length}
            </Text>
            <Text style={styles.summaryLabel}>달성 업적</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            전체 PR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recent' && styles.tabActive]}
          onPress={() => setSelectedTab('recent')}
        >
          <Text style={[styles.tabText, selectedTab === 'recent' && styles.tabTextActive]}>
            최근 PR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
            업적
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'all' && (
          <View style={styles.prList}>
            {prs.length > 0 ? (
              prs.map(renderPRItem)
            ) : (
              <Text style={styles.emptyText}>아직 개인 기록이 없습니다</Text>
            )}
          </View>
        )}

        {selectedTab === 'recent' && (
          <View style={styles.prList}>
            {recentPRs.length > 0 ? (
              recentPRs.map(renderPRItem)
            ) : (
              <Text style={styles.emptyText}>최근 30일 내 PR이 없습니다</Text>
            )}
          </View>
        )}

        {selectedTab === 'achievements' && (
          <View style={styles.achievementList}>
            {achievements.map(renderAchievement)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  prList: {
    paddingHorizontal: 20,
  },
  prCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 12,
  },
  prInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  prStats: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  prStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  prStatText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 4,
  },
  prDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  achievementList: {
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  achievementUnlocked: {
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  achievementTitleUnlocked: {
    color: Colors.text,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: 14,
  },
});