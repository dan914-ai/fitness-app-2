import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MenuStackScreenProps } from '../../navigation/types';

type Props = MenuStackScreenProps<'Help'>;

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '운동 기록은 어떻게 시작하나요?',
    answer: '기록 탭에서 "새 운동" 버튼을 눌러 운동을 시작할 수 있습니다. 운동 종목을 선택하고 세트와 무게를 입력하세요.',
    category: '운동 기록',
  },
  {
    id: '2',
    question: '운동 프로그램은 어떻게 만드나요?',
    answer: '메뉴에서 "운동 프로그램"을 선택하고 새 프로그램을 만들 수 있습니다. 운동 종목과 세트, 휴식 시간을 설정하세요.',
    category: '운동 기록',
  },
  {
    id: '3',
    question: '친구를 어떻게 추가하나요?',
    answer: '소셜 탭에서 "사용자 찾기"를 통해 친구를 검색하고 친구 요청을 보낼 수 있습니다.',
    category: '소셜',
  },
  {
    id: '4',
    question: '챌린지에 참여하려면 어떻게 하나요?',
    answer: '소셜 탭의 "챌린지"에서 참여 가능한 챌린지를 확인하고 "참여하기" 버튼을 눌러주세요.',
    category: '소셜',
  },
  {
    id: '5',
    question: '통계는 어떻게 확인하나요?',
    answer: '통계 탭에서 운동 분석, 근력 진행도, 신체 측정 등 다양한 통계를 확인할 수 있습니다.',
    category: '통계',
  },
  {
    id: '6',
    question: '진행 사진은 어디서 관리하나요?',
    answer: '기록 탭이나 통계 탭에서 "진행 사진"을 선택하여 사진을 추가하고 관리할 수 있습니다.',
    category: '기록 관리',
  },
  {
    id: '7',
    question: '알림 설정은 어떻게 변경하나요?',
    answer: '메뉴 > 설정 > 알림 설정에서 운동 리마인더, 소셜 알림 등을 설정할 수 있습니다.',
    category: '설정',
  },
  {
    id: '8',
    question: '데이터를 백업할 수 있나요?',
    answer: '메뉴 > 설정 > 개인정보 설정에서 "데이터 내보내기"를 통해 개인 데이터를 백업할 수 있습니다.',
    category: '설정',
  },
];

export default function HelpScreen({ navigation }: Props) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', '운동 기록', '소셜', '통계', '기록 관리', '설정'];
  const categoryLabels = {
    all: '전체',
    '운동 기록': '운동 기록',
    소셜: '소셜',
    통계: '통계',
    '기록 관리': '기록 관리',
    설정: '설정',
  };

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = () => {
    Alert.alert(
      '고객 지원',
      '어떤 방법으로 문의하시겠습니까?',
      [
        {
          text: '이메일',
          onPress: () => Alert.alert('이메일', 'support@fitness-app.com으로 문의해주세요.'),
        },
        {
          text: '전화',
          onPress: () => Alert.alert('전화', '1588-1234로 연락해주세요.\n운영시간: 평일 9시-18시'),
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.activeCategoryButton,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.activeCategoryButtonText,
            ]}
          >
            {categoryLabels[category]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFAQItem = (faq: FAQItem) => (
    <View key={faq.id} style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(faq.id)}
      >
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        <Icon
          name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
          size={24}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      {expandedFAQ === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  const renderQuickHelp = () => (
    <View style={styles.quickHelpSection}>
      <Text style={styles.sectionTitle}>빠른 도움말</Text>
      <View style={styles.quickHelpGrid}>
        <TouchableOpacity
          style={styles.quickHelpItem}
          onPress={() => Alert.alert('운동 시작하기', '기록 탭 > 새 운동을 눌러 운동을 시작하세요.')}
        >
          <Icon name="play-arrow" size={32} color={Colors.primary} />
          <Text style={styles.quickHelpText}>운동 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickHelpItem}
          onPress={() => Alert.alert('친구 추가하기', '소셜 탭 > 사용자 찾기에서 친구를 검색하세요.')}
        >
          <Icon name="person-add" size={32} color={Colors.secondary} />
          <Text style={styles.quickHelpText}>친구 추가하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickHelpItem}
          onPress={() => Alert.alert('통계 보기', '통계 탭에서 운동 분석과 진행도를 확인하세요.')}
        >
          <Icon name="bar-chart" size={32} color={Colors.accent} />
          <Text style={styles.quickHelpText}>통계 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickHelpItem}
          onPress={() => Alert.alert('설정 변경', '메뉴 탭 > 설정에서 앱 설정을 변경하세요.')}
        >
          <Icon name="settings" size={32} color={Colors.warning} />
          <Text style={styles.quickHelpText}>설정 변경</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>도움말</Text>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Icon name="support-agent" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderQuickHelp()}

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 내용을 검색하세요"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textLight}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="clear" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {renderCategoryFilter()}

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          <View style={styles.faqList}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(renderFAQItem)
            ) : (
              <View style={styles.noResults}>
                <Icon name="search-off" size={48} color={Colors.textLight} />
                <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
                <Text style={styles.noResultsSubtext}>
                  다른 키워드로 검색하거나 고객 지원에 문의해주세요
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>문제가 해결되지 않았나요?</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <Icon name="support-agent" size={24} color={Colors.surface} />
            <Text style={styles.contactButtonText}>고객 지원 문의</Text>
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
  supportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  quickHelpSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  quickHelpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickHelpItem: {
    width: '48%',
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickHelpText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  categoryFilter: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeCategoryButtonText: {
    color: Colors.surface,
  },
  faqSection: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  faqList: {
    marginTop: 8,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: 4,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 16,
    paddingLeft: 8,
  },
  faqAnswerText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 12,
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 16,
  },
  contactButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});