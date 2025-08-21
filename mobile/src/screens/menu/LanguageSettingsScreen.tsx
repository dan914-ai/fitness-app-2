import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';

type Props = MenuStackScreenProps<'LanguageSettings'>;

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

export default function LanguageSettingsScreen({ navigation }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');

  useEffect(() => {
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('언어 설정 로드 실패:', error);
    }
  };

  const saveLanguageSettings = async (languageCode: string) => {
    try {
      await AsyncStorage.setItem('appLanguage', languageCode);
      setSelectedLanguage(languageCode);
      Alert.alert(
        '언어 변경',
        '언어가 변경되었습니다. 앱을 재시작하면 적용됩니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('언어 설정 저장 실패:', error);
      Alert.alert('오류', '언어 설정 저장에 실패했습니다.');
    }
  };

  const renderLanguageOption = (language: Language) => (
    <TouchableOpacity
      key={language.code}
      style={styles.languageItem}
      onPress={() => saveLanguageSettings(language.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.languageText}>
          <Text style={styles.languageName}>{language.nativeName}</Text>
          <Text style={styles.languageSubtext}>{language.name}</Text>
        </View>
      </View>
      {selectedLanguage === language.code && (
        <Icon name="check" size={24} color={Colors.primary} />
      )}
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
        <Text style={styles.headerTitle}>언어 설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            앱에서 사용할 언어를 선택하세요. 변경 후 앱을 재시작하면 적용됩니다.
          </Text>
        </View>

        <View style={styles.languageList}>
          {languages.map(renderLanguageOption)}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color={Colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>언어 변경 안내</Text>
              <Text style={styles.infoText}>
                • 언어 변경 후 앱을 완전히 종료하고 다시 시작해주세요{'\n'}
                • 일부 텍스트는 업데이트에 시간이 걸릴 수 있습니다{'\n'}
                • 서버 데이터는 원본 언어로 표시될 수 있습니다
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
  description: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  languageList: {
    backgroundColor: Colors.surface,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  languageSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
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