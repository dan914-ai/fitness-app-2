import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { AuthStackScreenProps } from '../../navigation/types';
import { supabase } from '../../config/supabase';
import { authService } from '../../services/auth.service.supabase';

type RegisterScreenProps = AuthStackScreenProps<'Register'>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    
    try {
      // Use auth service for registration with email verification
      const username = email.split('@')[0]; // Extract username from email
      await authService.register(username, email, password);
      
      // If we get here without error, email verification is disabled
      Alert.alert(
        '회원가입 성공',
        '회원가입이 완료되었습니다.',
        [{ text: '확인', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      // Check if email verification is required
      if (error.message.includes('확인 이메일')) {
        Alert.alert(
          '이메일 확인 필요',
          '가입하신 이메일로 확인 링크를 전송했습니다. 이메일을 확인한 후 로그인해주세요.',
          [
            { text: '확인', onPress: () => navigation.navigate('Login') },
            { 
              text: '재전송', 
              onPress: async () => {
                try {
                  await authService.resendVerificationEmail(email);
                  Alert.alert('전송 완료', '확인 이메일을 다시 전송했습니다.');
                } catch (resendError: any) {
                  Alert.alert('전송 실패', resendError.message);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('회원가입 실패', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>새 계정을 만들어보세요</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '처리 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              이미 계정이 있으신가요? 로그인
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 12,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});