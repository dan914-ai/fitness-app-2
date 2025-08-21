import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import analyticsService from '../../services/analytics.service';

type ExportType = 'workout' | 'body' | 'all';
type ExportFormat = 'csv' | 'json';

export default function DataExportScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState<ExportType>('workout');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);

  const exportTypes = [
    {
      key: 'workout' as ExportType,
      title: '운동 데이터',
      description: '운동 기록, 세트, 중량 등의 데이터',
      icon: 'fitness-center',
    },
    {
      key: 'body' as ExportType,
      title: '신체 측정',
      description: '체중, 체지방률, 둘레 측정 데이터',
      icon: 'straighten',
    },
    {
      key: 'all' as ExportType,
      title: '전체 데이터',
      description: '모든 운동 및 신체 데이터',
      icon: 'folder',
    },
  ];

  const exportFormats = [
    {
      key: 'csv' as ExportFormat,
      title: 'CSV',
      description: '엑셀에서 열 수 있는 형식',
      icon: 'table-chart',
    },
    {
      key: 'json' as ExportFormat,
      title: 'JSON',
      description: '프로그래밍에 적합한 형식',
      icon: 'code',
    },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await analyticsService.exportData(selectedType, selectedFormat);
      
      // In a real app, you would use a file sharing library like react-native-fs
      // or react-native-share to save or share the file
      Alert.alert(
        '내보내기 완료',
        `${selectedType} 데이터가 ${selectedFormat.toUpperCase()} 형식으로 내보내졌습니다.`,
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('오류', '데이터 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>데이터 내보내기</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>내보낼 데이터 선택</Text>
      {exportTypes.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.optionCard,
            selectedType === type.key && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedType(type.key)}
        >
          <Icon
            name={type.icon}
            size={24}
            color={selectedType === type.key ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                selectedType === type.key && styles.optionTitleSelected,
              ]}
            >
              {type.title}
            </Text>
            <Text style={styles.optionDescription}>{type.description}</Text>
          </View>
          <View style={styles.radioButton}>
            {selectedType === type.key && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFormatSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>파일 형식 선택</Text>
      {exportFormats.map((format) => (
        <TouchableOpacity
          key={format.key}
          style={[
            styles.optionCard,
            selectedFormat === format.key && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedFormat(format.key)}
        >
          <Icon
            name={format.icon}
            size={24}
            color={selectedFormat === format.key ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                selectedFormat === format.key && styles.optionTitleSelected,
              ]}
            >
              {format.title}
            </Text>
            <Text style={styles.optionDescription}>{format.description}</Text>
          </View>
          <View style={styles.radioButton}>
            {selectedFormat === format.key && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderExportInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>내보내기 정보</Text>
      <View style={styles.infoCard}>
        <Icon name="info" size={24} color={Colors.accent} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>데이터 보안</Text>
          <Text style={styles.infoDescription}>
            내보낸 데이터는 개인정보이므로 안전하게 보관해주세요.
          </Text>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Icon name="schedule" size={24} color={Colors.warning} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>처리 시간</Text>
          <Text style={styles.infoDescription}>
            데이터 양에 따라 내보내기에 시간이 걸릴 수 있습니다.
          </Text>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Icon name="file-download" size={24} color={Colors.success} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>파일 저장</Text>
          <Text style={styles.infoDescription}>
            내보낸 파일은 다운로드 폴더에 저장됩니다.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderExportButton = () => (
    <View style={styles.exportSection}>
      <TouchableOpacity
        style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
        onPress={handleExport}
        disabled={exporting}
      >
        {exporting ? (
          <>
            <Icon name="refresh" size={24} color={Colors.surface} />
            <Text style={styles.exportButtonText}>내보내는 중...</Text>
          </>
        ) : (
          <>
            <Icon name="file-download" size={24} color={Colors.surface} />
            <Text style={styles.exportButtonText}>데이터 내보내기</Text>
          </>
        )}
      </TouchableOpacity>
      
      <Text style={styles.exportNote}>
        선택한 데이터를 {selectedFormat.toUpperCase()} 형식으로 내보냅니다.
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}
      {renderTypeSelector()}
      {renderFormatSelector()}
      {renderExportInfo()}
      {renderExportButton()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  exportSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  exportButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  exportButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exportNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});