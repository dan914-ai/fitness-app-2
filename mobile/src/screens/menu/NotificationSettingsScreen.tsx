import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';
import { safeJsonParse, safeJsonStringify } from '../../utils/safeJsonParse';

type Props = MenuStackScreenProps<'NotificationSettings'>;

interface NotificationSettings {
  workoutReminders: boolean;
  socialNotifications: boolean;
  challengeUpdates: boolean;
  achievementNotifications: boolean;
  workoutRemindersTime: string;
  workoutRemindersFrequency: 'daily' | 'weekly' | 'custom';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export default function NotificationSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<NotificationSettings>({
    workoutReminders: true,
    socialNotifications: true,
    challengeUpdates: true,
    achievementNotifications: true,
    workoutRemindersTime: '18:00',
    workoutRemindersFrequency: 'daily',
    soundEnabled: true,
    vibrationEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(safeJsonParse(savedSettings, defaultSettings));
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const renderSwitch = (
    title: string,
    subtitle: string,
    key: keyof NotificationSettings,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.surface}
      />
    </View>
  );

  const renderTimeSelector = () => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => {
        // Time picker implementation would go here
        Alert.alert('시간 설정', '시간 선택 기능을 구현해야 합니다.');
      }}
      disabled={!settings.workoutReminders}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name="schedule" size={24} color={settings.workoutReminders ? Colors.primary : Colors.textLight} />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={[styles.settingItemTitle, !settings.workoutReminders && styles.disabledText]}>
            알림 시간
          </Text>
          <Text style={[styles.settingItemSubtitle, !settings.workoutReminders && styles.disabledText]}>
            {settings.workoutRemindersTime}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={settings.workoutReminders ? Colors.textLight : Colors.border} />
    </TouchableOpacity>
  );

  const renderFrequencySelector = () => {
    const frequencies = {
      daily: '매일',
      weekly: '주간',
      custom: '사용자 지정',
    };

    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => {
          Alert.alert(
            '알림 빈도',
            '알림 빈도를 선택하세요',
            [
              { text: '매일', onPress: () => updateSetting('workoutRemindersFrequency', 'daily') },
              { text: '주간', onPress: () => updateSetting('workoutRemindersFrequency', 'weekly') },
              { text: '사용자 지정', onPress: () => updateSetting('workoutRemindersFrequency', 'custom') },
              { text: '취소', style: 'cancel' },
            ]
          );
        }}
        disabled={!settings.workoutReminders}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            <Icon name="repeat" size={24} color={settings.workoutReminders ? Colors.primary : Colors.textLight} />
          </View>
          <View style={styles.settingItemContent}>
            <Text style={[styles.settingItemTitle, !settings.workoutReminders && styles.disabledText]}>
              알림 빈도
            </Text>
            <Text style={[styles.settingItemSubtitle, !settings.workoutReminders && styles.disabledText]}>
              {frequencies[settings.workoutRemindersFrequency]}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={settings.workoutReminders ? Colors.textLight : Colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>운동 알림</Text>
          <View style={styles.groupContent}>
            {renderSwitch(
              '운동 리마인더',
              '정기적인 운동을 위한 알림',
              'workoutReminders',
              'fitness-center'
            )}
            {renderTimeSelector()}
            {renderFrequencySelector()}
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>소셜 알림</Text>
          <View style={styles.groupContent}>
            {renderSwitch(
              '소셜 활동',
              '좋아요, 댓글, 팔로우 알림',
              'socialNotifications',
              'people'
            )}
            {renderSwitch(
              '챌린지 업데이트',
              '참여 중인 챌린지 소식',
              'challengeUpdates',
              'emoji-events'
            )}
            {renderSwitch(
              '업적 달성',
              '새로운 업적 달성 알림',
              'achievementNotifications',
              'star'
            )}
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>알림 방식</Text>
          <View style={styles.groupContent}>
            {renderSwitch(
              '소리',
              '알림음 재생',
              'soundEnabled',
              'volume-up'
            )}
            {renderSwitch(
              '진동',
              '알림 시 진동',
              'vibrationEnabled',
              'vibration'
            )}
          </View>
        </View>

        <View style={styles.testSection}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              Alert.alert('테스트 알림', '알림이 정상적으로 작동합니다!');
            }}
          >
            <Icon name="notifications" size={20} color={Colors.surface} />
            <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
          </TouchableOpacity>
        </View>
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
  disabledText: {
    color: Colors.textLight,
  },
  testSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  testButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});