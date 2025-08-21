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

type Props = MenuStackScreenProps<'PrivacySettings'>;

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  workoutVisibility: 'public' | 'friends' | 'private';
  achievementVisibility: 'public' | 'friends' | 'private';
  allowFriendRequests: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  dataCollection: boolean;
  marketingEmails: boolean;
  analyticsSharing: boolean;
  locationTracking: boolean;
}

export default function PrivacySettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    workoutVisibility: 'friends',
    achievementVisibility: 'public',
    allowFriendRequests: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
    dataCollection: true,
    marketingEmails: false,
    analyticsSharing: true,
    locationTracking: false,
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('privacySettings');
      if (savedSettings) {
        setSettings(safeJsonParse(savedSettings, defaultSettings));
      }
    } catch (error) {
      console.error('개인정보 설정 로드 실패:', error);
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('개인정보 설정 저장 실패:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    savePrivacySettings(newSettings);
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return '공개';
      case 'friends':
        return '친구만';
      case 'private':
        return '비공개';
      default:
        return '공개';
    }
  };

  const showVisibilitySelector = (
    title: string,
    currentValue: string,
    key: keyof PrivacySettings
  ) => {
    Alert.alert(
      title,
      '공개 범위를 선택하세요',
      [
        {
          text: '공개',
          onPress: () => updateSetting(key, 'public'),
        },
        {
          text: '친구만',
          onPress: () => updateSetting(key, 'friends'),
        },
        {
          text: '비공개',
          onPress: () => updateSetting(key, 'private'),
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const renderVisibilityItem = (
    title: string,
    subtitle: string,
    key: keyof PrivacySettings,
    icon: string
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => showVisibilitySelector(title, settings[key] as string, key)}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingItemRight}>
        <Text style={styles.visibilityText}>
          {getVisibilityText(settings[key] as string)}
        </Text>
        <Icon name="chevron-right" size={24} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  const renderSwitch = (
    title: string,
    subtitle: string,
    key: keyof PrivacySettings,
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

  const handleDataDeletion = () => {
    Alert.alert(
      '데이터 삭제',
      '정말로 모든 개인 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // API call to delete user data
            Alert.alert('알림', '데이터 삭제 요청이 접수되었습니다. 처리까지 최대 30일이 소요될 수 있습니다.');
          },
        },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      '데이터 내보내기',
      '개인 데이터를 내보내시겠습니까? 처리 완료 후 이메일로 다운로드 링크를 보내드립니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '내보내기',
          onPress: () => {
            // API call to export user data
            Alert.alert('알림', '데이터 내보내기 요청이 접수되었습니다. 완료되면 이메일로 알려드립니다.');
          },
        },
      ]
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
        <Text style={styles.headerTitle}>개인정보 설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>프로필 공개 설정</Text>
          <View style={styles.groupContent}>
            {renderVisibilityItem(
              '프로필 공개 범위',
              '프로필 정보 공개 범위',
              'profileVisibility',
              'person'
            )}
            {renderVisibilityItem(
              '운동 기록 공개',
              '운동 기록 및 통계 공개 범위',
              'workoutVisibility',
              'fitness-center'
            )}
            {renderVisibilityItem(
              '업적 공개',
              '달성한 업적 공개 범위',
              'achievementVisibility',
              'emoji-events'
            )}
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>소셜 기능</Text>
          <View style={styles.groupContent}>
            {renderSwitch(
              '친구 요청 허용',
              '다른 사용자의 친구 요청 받기',
              'allowFriendRequests',
              'person-add'
            )}
            {renderSwitch(
              '쪽지 허용',
              '다른 사용자의 직접 메시지 받기',
              'allowDirectMessages',
              'message'
            )}
            {renderSwitch(
              '온라인 상태 표시',
              '다른 사용자에게 온라인 상태 공개',
              'showOnlineStatus',
              'radio-button-on'
            )}
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>데이터 및 개인정보</Text>
          <View style={styles.groupContent}>
            {renderSwitch(
              '데이터 수집 허용',
              '앱 개선을 위한 사용 데이터 수집',
              'dataCollection',
              'analytics'
            )}
            {renderSwitch(
              '마케팅 이메일',
              '프로모션 및 마케팅 이메일 수신',
              'marketingEmails',
              'email'
            )}
            {renderSwitch(
              '분석 데이터 공유',
              '익명화된 분석 데이터 공유',
              'analyticsSharing',
              'share'
            )}
            {renderSwitch(
              '위치 추적',
              '운동 경로 및 위치 기반 서비스',
              'locationTracking',
              'location-on'
            )}
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>데이터 관리</Text>
          <View style={styles.groupContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDataExport}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="file-download" size={24} color={Colors.accent} />
                </View>
                <View style={styles.settingItemContent}>
                  <Text style={styles.settingItemTitle}>데이터 내보내기</Text>
                  <Text style={styles.settingItemSubtitle}>
                    내 개인 데이터를 다운로드
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={Colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDataDeletion}
            >
              <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, styles.dangerIcon]}>
                  <Icon name="delete-forever" size={24} color={Colors.error} />
                </View>
                <View style={styles.settingItemContent}>
                  <Text style={[styles.settingItemTitle, styles.dangerText]}>
                    모든 데이터 삭제
                  </Text>
                  <Text style={styles.settingItemSubtitle}>
                    계정 및 모든 개인 데이터 영구 삭제
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="privacy-tip" size={24} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>개인정보 보호</Text>
              <Text style={styles.infoText}>
                귀하의 개인정보는 안전하게 보호됩니다. 설정 변경은 즉시 적용되며, 
                언제든지 변경할 수 있습니다. 자세한 내용은 개인정보 처리방침을 참조하세요.
              </Text>
            </View>
          </View>
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
  dangerIcon: {
    backgroundColor: Colors.error + '20',
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
  dangerText: {
    color: Colors.error,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});