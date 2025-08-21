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
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { AuthStackScreenProps } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { productionAuthService } from '../../services/auth.service.production';
import CustomAlert from '../../components/CustomAlert';

export default function LoginScreenProduction({ navigation }: AuthStackScreenProps<'Login'>) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [alert, setAlert] = useState<{visible: boolean; title: string; message: string}>({
    visible: false,
    title: '',
    message: ''
  });

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }
    
    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
      
      if (!formData.fullName) {
        newErrors.fullName = '이름을 입력해주세요';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up
        const result = await productionAuthService.signUp(
          formData.email,
          formData.password,
          formData.fullName
        );
        
        if (result.success) {
          if (result.error) {
            // Email confirmation required but we allow temp access
            Alert.alert(
              '회원가입 성공',
              result.error,
              [
                {
                  text: '확인',
                  onPress: () => {
                    // User is already logged in with temp session
                    // Navigation will be handled by auth state change
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              '회원가입 완료',
              '성공적으로 가입되었습니다!',
              [
                {
                  text: '확인',
                  onPress: () => {
                    // Navigation will be handled by auth state change
                  },
                },
              ]
            );
          }
        } else {
          console.log('Sign up failed:', result.error);
          showAlert('회원가입 실패', result.error || '알 수 없는 오류가 발생했습니다');
        }
      } else {
        // Sign in
        console.log('Attempting sign in...');
        const result = await productionAuthService.signIn(
          formData.email,
          formData.password
        );
        
        console.log('Sign in result:', result);
        
        if (result.success) {
          // Navigation will be handled by auth state change in AppNavigator
          if (result.error) {
            // Show warning if email not confirmed
            showAlert('알림', result.error);
          }
        } else {
          const errorMessage = result.error || '이메일 또는 비밀번호를 확인해주세요';
          console.log('Login failed, showing alert:', errorMessage);
          showAlert('로그인 실패', errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error during auth:', error);
      showAlert('오류', error.message || '서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string) => {
    console.log('showAlert called:', title, message);
    
    // Use custom alert for web, native Alert for mobile
    if (Platform.OS === 'web') {
      setAlert({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

  const hideAlert = () => {
    setAlert({ visible: false, title: '', message: '' });
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Icon name="fitness-center" size={60} color={Colors.primary} />
          <Text style={styles.appName}>FitTracker</Text>
          <Text style={styles.subtitle}>운동 기록 & 진행 관리</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isSignUp ? '회원가입' : '로그인'}
          </Text>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="이름"
                placeholderTextColor={Colors.textLight}
                value={formData.fullName || ''}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>
          )}
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={Colors.textLight}
              value={formData.email || ''}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={Colors.textLight}
              value={formData.password || ''}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {isSignUp && (
            <>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={Colors.textLight}
                  value={formData.confirmPassword || ''}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? '회원가입' : '로그인'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onConfirm={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
});