import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EmptyHomeScreen() {
  // Clear everything on mount
  useEffect(() => {
    const clearEverything = async () => {
      console.error('🔥🔥🔥 EMERGENCY ROUTINE CLEAR 🔥🔥🔥');
      
      try {
        // Get all keys
        const allKeys = await AsyncStorage.getAllKeys();
        console.error('Found keys:', allKeys);
        
        // Remove ALL routine-related keys
        for (const key of allKeys) {
          if (key.toLowerCase().includes('routine') || 
              key.includes('루틴') ||
              key === '@user_routines' ||
              key === 'STORAGE_USER_ROUTINES') {
            await AsyncStorage.removeItem(key);
            console.error(`REMOVED: ${key}`);
          }
        }
        
        // Force set empty
        await AsyncStorage.setItem('@user_routines', '{}');
        await AsyncStorage.setItem('STORAGE_USER_ROUTINES', '{}');
        
        console.error('✅ ALL ROUTINES CLEARED');
      } catch (error) {
        console.error('Clear error:', error);
      }
    };
    
    clearEverything();
  }, []);

  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>루틴 완전 제거됨</Text>
        <Text style={styles.subtitle}>모든 루틴이 삭제되었습니다</Text>
      </View>

      <View style={styles.content}>
        <Icon name="check-circle" size={100} color={Colors.success} />
        <Text style={styles.message}>루틴이 완전히 제거되었습니다</Text>
        <Text style={styles.detail}>이제 새로운 루틴을 만들 수 있습니다</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('CreateRoutine')}
      >
        <Text style={styles.buttonText}>새 루틴 만들기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});