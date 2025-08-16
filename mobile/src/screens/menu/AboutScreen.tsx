import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';

type Props = MenuStackScreenProps<'About'>;

export default function AboutScreen({ navigation }: Props) {
  const appVersion = '1.0.0';
  const buildNumber = '2025.1';
  const releaseDate = '2025-01-15';

  const handleLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '링크를 열 수 없습니다.');
    }
  };

  const handleFeedback = () => {
    Alert.alert(
      '피드백 보내기',
      '어떤 방법으로 피드백을 보내시겠습니까?',
      [
        {
          text: '이메일',
          onPress: () => handleLink('mailto:support@fitness-app.com?subject=앱 피드백'),
        },
        {
          text: '앱스토어 리뷰',
          onPress: () => Alert.alert('알림', '앱스토어로 이동하여 리뷰를 작성해주세요.'),
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const renderInfoCard = (
    title: string,
    items: Array<{ label: string; value: string }>
  ) => (
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.infoItem}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );

  const renderLinkItem = (title: string, subtitle: string, icon: string, onPress: () => void) => (
    <TouchableOpacity style={styles.linkItem} onPress={onPress}>
      <View style={styles.linkItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.linkTitle}>{title}</Text>
          <Text style={styles.linkSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={Colors.textLight} />
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
        <Text style={styles.headerTitle}>앱 정보</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.appSection}>
          <View style={styles.appIcon}>
            <Icon name="fitness-center" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>Korean Fitness</Text>
          <Text style={styles.appTagline}>건강한 삶을 위한 당신의 파트너</Text>
        </View>

        {renderInfoCard('버전 정보', [
          { label: '앱 버전', value: appVersion },
          { label: '빌드 번호', value: buildNumber },
          { label: '출시일', value: releaseDate },
        ])}

        {renderInfoCard('개발 정보', [
          { label: '개발자', value: 'Korean Fitness Team' },
          { label: '기술 스택', value: 'React Native, TypeScript' },
          { label: '데이터베이스', value: 'PostgreSQL with Prisma' },
        ])}

        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>링크</Text>
          <View style={styles.linksContainer}>
            {renderLinkItem(
              '개인정보 처리방침',
              '개인정보 보호 정책 확인',
              'privacy-tip',
              () => handleLink('https://fitness-app.com/privacy')
            )}
            {renderLinkItem(
              '이용약관',
              '서비스 이용약관 확인',
              'description',
              () => handleLink('https://fitness-app.com/terms')
            )}
            {renderLinkItem(
              '오픈소스 라이선스',
              '사용된 오픈소스 라이브러리',
              'code',
              () => handleLink('https://fitness-app.com/licenses')
            )}
            {renderLinkItem(
              '지원 센터',
              '도움말 및 문의사항',
              'help-center',
              () => handleLink('https://fitness-app.com/support')
            )}
            {renderLinkItem(
              '피드백 보내기',
              '의견 및 개선사항 제안',
              'feedback',
              handleFeedback
            )}
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>주요 기능</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Icon name="fitness-center" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>운동 기록 및 추적</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="bar-chart" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>상세한 운동 분석</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="people" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>소셜 기능 및 챌린지</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="emoji-events" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>업적 시스템</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="photo-camera" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>진행 사진 관리</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="straighten" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>신체 측정 기록</Text>
            </View>
          </View>
        </View>

        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2025 Korean Fitness Team
          </Text>
          <Text style={styles.copyrightSubtext}>
            All rights reserved
          </Text>
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
  appSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surface,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  linksSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  linksContainer: {
    backgroundColor: Colors.surface,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  linkItemLeft: {
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
  linkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  linkSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  featuresSection: {
    marginTop: 24,
  },
  featuresList: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 24,
  },
  copyrightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
});