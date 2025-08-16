import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';
import authService from '../../services/auth.service';
import analyticsService from '../../services/analytics.service';

type Props = MenuStackScreenProps<'MenuMain'>;

export default function MenuScreen({ navigation }: Props) {

  const handleLogout = async () => {
    await authService.logout();
    // Navigation will be handled by auth state change
  };

  const menuSections = [
    {
      title: '운동 도구',
      items: [
        // { icon: 'fitness-center', title: '운동 프로그램', onPress: () => navigation.navigate('WorkoutPrograms') }, // DISABLED UNTIL FURTHER NOTICE
        { icon: 'play-circle', title: '운동 GIF 테스트', onPress: () => navigation.navigate('ExerciseTest') },
        { icon: 'calculate', title: '1RM 계산기', onPress: () => navigation.navigate('OneRMCalculator') },
        { icon: 'local-fire-department', title: '칼로리 계산기', onPress: () => navigation.navigate('CalorieCalculator') },
        { icon: 'pie-chart', title: '매크로 계산기', onPress: () => navigation.navigate('MacroCalculator') },
      ]
    },
    {
      title: '계정',
      items: [
        { icon: 'person', title: '프로필', onPress: () => navigation.navigate('Profile') },
        { icon: 'settings', title: '설정', onPress: () => navigation.navigate('Settings') },
      ]
    },
    {
      title: '기타',
      items: [
        { icon: 'help', title: '도움말', onPress: () => navigation.navigate('Help') },
        { icon: 'info', title: '앱 정보', onPress: () => navigation.navigate('About') },
        { icon: 'logout', title: '로그아웃', onPress: handleLogout },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color={Colors.textLight} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>사용자</Text>
          </View>
        </View>
      </View>

      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuList}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === section.items.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.onPress}
              >
                <Icon name={item.icon} size={24} color={Colors.text} />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Icon name="chevron-right" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tier: {
    fontSize: 16,
    color: Colors.bronze,
    marginTop: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  pointsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  tierProgressSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  tierProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tierProgressSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tierProgressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tierProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  currentPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  nextTierPoints: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuList: {
    backgroundColor: Colors.surface,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
});