import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';
import { useSettings } from '../../hooks/useSettings';

type Props = MenuStackScreenProps<'Settings'>;

interface SettingItem {
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'switch';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
}

export default function SettingsScreen({ navigation }: Props) {
  const { settings, updateSetting } = useSettings();
  
  const settingsGroups = [
    {
      title: '운동',
      items: [
        {
          icon: 'timer',
          title: '운동 타이머',
          subtitle: '운동 시간을 측정합니다',
          type: 'switch' as const,
          value: settings.workoutTimerEnabled,
          onValueChange: (value: boolean) => updateSetting('workoutTimerEnabled', value),
        },
        {
          icon: 'hourglass-empty',
          title: '휴식 타이머',
          subtitle: '세트 간 휴식 시간을 표시합니다',
          type: 'switch' as const,
          value: settings.restTimerEnabled,
          onValueChange: (value: boolean) => updateSetting('restTimerEnabled', value),
        },
        // Removed auto-start option as timer is now manual only
        // {
        //   icon: 'play-arrow',
        //   title: '휴식 타이머 자동 시작',
        //   subtitle: '세트 완료 시 자동으로 시작',
        //   type: 'switch' as const,
        //   value: settings.autoStartRestTimer,
        //   onValueChange: (value: boolean) => updateSetting('autoStartRestTimer', value),
        // },
      ],
    },
    {
      title: '알림',
      items: [
        {
          icon: 'notifications',
          title: '알림 설정',
          subtitle: '운동 알림, 소셜 알림 관리',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      title: '앱 설정',
      items: [
        {
          icon: 'language',
          title: '언어',
          subtitle: '한국어',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('LanguageSettings'),
        },
        {
          icon: 'straighten',
          title: '단위',
          subtitle: 'kg, cm',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('UnitSettings'),
        },
      ],
    },
    {
      title: '개인정보',
      items: [
        {
          icon: 'privacy-tip',
          title: '개인정보 설정',
          subtitle: '프로필 공개 범위, 데이터 관리',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('PrivacySettings'),
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          icon: 'help',
          title: '도움말',
          subtitle: '자주 묻는 질문, 사용 가이드',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('Help'),
        },
        {
          icon: 'info',
          title: '앱 정보',
          subtitle: '버전 정보, 개발자 정보',
          type: 'navigation' as const,
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={24} color={Colors.primary} />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.surface}
          />
        ) : (
          <Icon name="chevron-right" size={24} color={Colors.textLight} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContent}>
              {group.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  settingGroup: {
    marginTop: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupContent: {
    backgroundColor: Colors.surface,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});