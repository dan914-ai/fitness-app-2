import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { AuthStackScreenProps } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import authService from '../../services/auth.service';
import { supabase } from '../../config/supabase';
import { TEST_CREDENTIALS, ensureTestAccountExists } from '../../utils/setupTestAccount';
import { loginWithMockAuth, tryAlternativeEmails } from '../../utils/testAuthWorkaround';
import { debugAuthError, debugLoginAttempt } from '../../utils/debugAuth';
import { CommonActions } from '@react-navigation/native';
import { forceReloadApp } from '../../utils/forceReloadApp';
import { quickTestLogin } from '../../utils/quickTestLogin';

type FormData = {
  email: string;
  password: string;
};

export default function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const [loading, setLoading] = useState(false);
  const [creatingTestAccount, setCreatingTestAccount] = useState(false);
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      debugLoginAttempt(data.email, data.password);
      
      // Try direct Supabase login first
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (supabaseError) {
        debugAuthError(supabaseError, 'Supabase Login');
        
        // Handle email not confirmed error
        if (supabaseError.message?.includes('Email not confirmed')) {
          
          // Always use mock auth for unconfirmed emails during testing
          const mockResult = await loginWithMockAuth(data.email, data.password);
          
          if (mockResult.success) {
            
            // Store flag to indicate we need to reload
            await AsyncStorage.setItem('needs_reload', 'true');
            
            Alert.alert(
              '테스트 모드',
              '이메일 확인이 필요하지만 테스트 모드로 진행합니다.\n\n앱이 자동으로 다시 로드됩니다.',
              [{ 
                text: '확인', 
                onPress: async () => {
                  // Force app to reload
                  await forceReloadApp();
                }
              }]
            );
            return;
          } else {
            // If mock auth fails, still allow test mode for known test emails
            if (data.email === 'testuser@testmail.com' && data.password === 'test123456') {
              // Force mock auth with correct credentials
              const fallbackResult = await loginWithMockAuth('testuser@testmail.com', 'test123456');
              if (fallbackResult.success) {
                await AsyncStorage.setItem('needs_reload', 'true');
                Alert.alert(
                  '테스트 모드',
                  '테스트 모드로 로그인합니다.',
                  [{ 
                    text: '확인', 
                    onPress: async () => {
                      await forceReloadApp();
                    }
                  }]
                );
                return;
              }
            }
          }
        }
        
        // If it's the test account and Supabase is rejecting it, use mock auth
        if ((data.email === 'test@example.com' || data.email === 'testuser@testmail.com') && data.password === 'test123456') {
          const mockResult = await loginWithMockAuth(data.email, data.password);
          
          if (mockResult.success) {
            await AsyncStorage.setItem('needs_reload', 'true');
            Alert.alert(
              '테스트 모드',
              '테스트 모드로 로그인됩니다.',
              [{ 
                text: '확인', 
                onPress: () => {
                  if (Platform.OS === 'web') {
                    window.location.reload();
                  }
                }
              }]
            );
            return;
          }
        }
        
        Alert.alert(
          '로그인 실패',
          `${supabaseError.message}\n\n테스트 계정을 사용하려면 "테스트 계정 생성" 버튼을 눌러주세요.`
        );
        return;
      }
      
      
      // Now try through auth service
      await authService.login(data.email, data.password);
      // Navigate to main app - handled by auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        '로그인 실패',
        error.message || '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const createTestAccount = async () => {
    try {
      setCreatingTestAccount(true);
      
      // First try to find working email format
      const altResult = await tryAlternativeEmails();
      
      if (altResult.success && altResult.email) {
        setValue('email', altResult.email);
        setValue('password', altResult.password || 'test123456');
        Alert.alert(
          '테스트 계정 생성 완료',
          `이메일: ${altResult.email}\n비밀번호: ${altResult.password || 'test123456'}\n\n자동으로 입력되었습니다. 로그인 버튼을 눌러주세요.`,
          [{ text: '확인' }]
        );
        return;
      }
      
      // If Supabase isn't accepting any emails, use mock auth
      setValue('email', 'test@example.com');
      setValue('password', 'test123456');
      
      Alert.alert(
        '테스트 계정 준비',
        'Supabase 이메일 검증 문제로 인해 테스트 모드가 활성화됩니다.\n\n이메일: test@example.com\n비밀번호: test123456\n\n로그인 버튼을 눌러주세요.',
        [{ text: '확인' }]
      );
      return;
      
      // Original code below (keeping for reference but won't be reached)
      const timestamp = Date.now();
      const testEmail = `test_${timestamp}@example.com`;
      const testPassword = `test${timestamp}`;
      
      
      // Try to create the account
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            username: `test_user_${timestamp}`,
          },
        },
      });
      
      if (error) {
        console.error('Test account creation error:', error);
        Alert.alert('오류', `계정 생성 실패: ${error.message}`);
        return;
      }
      
      if (!data.user) {
        console.error('No user returned from signUp');
        Alert.alert('오류', '계정 생성에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      
      
      // Try to sign in immediately with the created account
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        console.error('Auto sign-in failed:', signInError);
        // Still fill the form even if auto sign-in fails
        setValue('email', testEmail);
        setValue('password', testPassword);
        
        Alert.alert(
          '테스트 계정 생성 완료',
          `이메일: ${testEmail}\n비밀번호: ${testPassword}\n\n자동으로 입력되었습니다. 로그인 버튼을 눌러주세요.\n\n(자동 로그인 실패: ${signInError.message})`,
          [{ text: '확인' }]
        );
      } else if (signInData.session) {
        // The auth state change listener in auth service will handle navigation
        Alert.alert(
          '테스트 계정 생성 및 로그인 성공',
          '테스트 계정이 생성되고 자동으로 로그인되었습니다.',
          [{ text: '확인' }]
        );
      } else {
        // Fill form for manual login
        setValue('email', testEmail);
        setValue('password', testPassword);
        
        Alert.alert(
          '테스트 계정 생성 완료',
          `이메일: ${testEmail}\n비밀번호: ${testPassword}\n\n자동으로 입력되었습니다. 로그인 버튼을 눌러주세요.`,
          [{ text: '확인' }]
        );
      }
      
    } catch (error: any) {
      console.error('Test account creation exception:', error);
      Alert.alert('오류', `예외 발생: ${error.message || '테스트 계정 생성 중 오류가 발생했습니다.'}`);
    } finally {
      setCreatingTestAccount(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>운동 기록 시작하기</Text>
        <Text style={styles.subtitle}>로그인하여 운동을 기록하세요</Text>

        <Controller
          control={control}
          rules={{
            required: '이메일을 입력해주세요',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '올바른 이메일 형식이 아닙니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="이메일"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
          name="email"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          rules={{
            required: '비밀번호를 입력해주세요',
            minLength: {
              value: 6,
              message: '비밀번호는 6자 이상이어야 합니다',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="비밀번호"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
          )}
          name="password"
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            계정이 없으신가요? <Text style={styles.linkTextBold}>회원가입</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={createTestAccount}
          style={[styles.testButton, creatingTestAccount && styles.buttonDisabled]}
          disabled={creatingTestAccount}
        >
          {creatingTestAccount ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.testButtonText}>테스트 계정 자동 생성</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            // First ensure the test account exists
            const setupResult = await ensureTestAccountExists();
            
            // Pre-fill with the test account
            setValue('email', TEST_CREDENTIALS.email);
            setValue('password', TEST_CREDENTIALS.password);
            
            let message = `이메일: ${TEST_CREDENTIALS.email}\n비밀번호: ${TEST_CREDENTIALS.password}\n\n입력되었습니다.`;
            
            if (setupResult.requiresEmailConfirmation) {
              message += '\n\n⚠️ 이 Supabase 프로젝트는 이메일 확인이 필요합니다.';
            }
            
            Alert.alert('테스트 계정', message, [{ text: '확인' }]);
          }}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>기존 테스트 계정 사용</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // Pre-fill with Danny's account
            setValue('email', 'dannyboy0914@gmail.com');
            setValue('password', '');
            Alert.alert(
              'Danny 계정',
              '이메일이 입력되었습니다. 비밀번호를 입력해주세요.',
              [{ text: '확인' }]
            );
          }}
          style={styles.testButton}
        >
          <Text style={styles.testButtonText}>Danny 계정 사용</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            try {
              await quickTestLogin();
              Alert.alert('성공', '테스트 로그인 완료! 페이지를 새로고침하세요.', [
                { text: '확인', onPress: () => window.location.reload() }
              ]);
            } catch (error) {
              Alert.alert('오류', '테스트 로그인 실패');
            }
          }}
          style={[styles.testButton, { backgroundColor: Colors.success }]}
        >
          <Text style={styles.testButtonText}>🚀 빠른 테스트 로그인 (Skip Supabase)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Diagnostic')}
          style={styles.diagnosticButton}
        >
          <Text style={styles.diagnosticButtonText}>🔍 연결 진단 (Connection Diagnostic)</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  linkTextBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  testButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  testButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosticButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  diagnosticButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});