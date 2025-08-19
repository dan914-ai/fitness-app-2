import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
}

class ProductionAuthService {
  private authStateListeners: ((authenticated: boolean) => void)[] = [];

  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    try {
      
      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || ''
          },
          emailRedirectTo: window?.location?.origin || undefined
        }
      });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific errors
        if (error.message?.includes('User already registered')) {
          // Try to sign in instead
          return this.signIn(email, password);
        }
        
        if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
          return {
            success: false,
            error: '이메일 형식이 올바르지 않거나 비밀번호가 너무 짧습니다 (최소 6자)'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Signup failed'
        };
      }

      if (data?.user) {
        
        // Check if session was created (email confirmation not required)
        if (data.session) {
          await this.storeSession(data.user);
          this.notifyAuthStateChange(true);
          return {
            success: true,
            user: data.user
          };
        } else {
          // Store user data for later use but don't authenticate
          await this.storeUnconfirmedUser(data.user);
          
          // For development, we can still let them in
          const mockSession = {
            ...data.user,
            email_confirmed_at: null,
            is_temp_session: true
          };
          await this.storeSession(mockSession);
          this.notifyAuthStateChange(true);
          
          return {
            success: true,
            user: mockSession,
            error: '이메일 인증이 필요합니다. 임시로 접속합니다.'
          };
        }
      }

      return {
        success: false,
        error: 'Signup failed - no user returned'
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.message || 'Signup failed'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Email not confirmed')) {
          // For unconfirmed emails, we'll still allow access but with a warning
          const tempUser = {
            id: `temp-${email}`,
            email,
            email_confirmed_at: null
          };
          
          await this.storeSession(tempUser);
          
          return {
            success: true,
            user: tempUser,
            error: '이메일 인증이 필요합니다. 임시 세션으로 진행합니다.'
          };
        }

        if (error.message?.includes('Invalid login credentials')) {
          return {
            success: false,
            error: '이메일 또는 비밀번호가 올바르지 않습니다'
          };
        }

        if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
          return {
            success: false,
            error: '올바른 이메일과 비밀번호를 입력해주세요'
          };
        }

        return {
          success: false,
          error: error.message || '로그인에 실패했습니다'
        };
      }

      if (data?.user) {
        await this.storeSession(data.user);
        this.notifyAuthStateChange(true);
        
        return {
          success: true,
          user: data.user
        };
      }

      return {
        success: false,
        error: 'Login failed - no user returned'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove([
        '@user_session',
        '@user_data',
        '@auth_token'
      ]);
      this.notifyAuthStateChange(false);
    } catch (error) {
      console.error('Signout error:', error);
      // Even if signout fails, clear local data
      await AsyncStorage.multiRemove([
        '@user_session',
        '@user_data',
        '@auth_token'
      ]);
      this.notifyAuthStateChange(false);
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      // First try to get from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return user;
      }

      // Fallback to local storage
      const localUser = await AsyncStorage.getItem('@user_data');
      if (localUser) {
        return JSON.parse(localUser);
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      
      // Try to get from local storage as fallback
      try {
        const localUser = await AsyncStorage.getItem('@user_data');
        if (localUser) {
          return JSON.parse(localUser);
        }
      } catch {
        // Ignore local storage errors
      }
      
      return null;
    }
  }

  async getSession(): Promise<any | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  private async storeSession(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(user));
      await AsyncStorage.setItem('@user_session', JSON.stringify({
        user,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Store session error:', error);
    }
  }

  private async storeUnconfirmedUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem('@unconfirmed_user', JSON.stringify({
        user,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Store unconfirmed user error:', error);
    }
  }

  onAuthStateChange(callback: (authenticated: boolean) => void): () => void {
    // Add listener
    this.authStateListeners.push(callback);

    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthenticated = !!session;
      callback(isAuthenticated);
    });

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
      subscription?.unsubscribe();
    };
  }

  private notifyAuthStateChange(authenticated: boolean): void {
    this.authStateListeners.forEach(listener => listener(authenticated));
  }

  // Development/Testing helper
  async createTestAccount(): Promise<AuthResponse> {
    // Use a more realistic email that Supabase will accept
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    // First try to sign in with a known test account
    const knownTestEmail = 'testuser@gmail.com';
    const signInResult = await this.signIn(knownTestEmail, testPassword);
    if (signInResult.success) {
      return signInResult;
    }
    
    // If sign in fails, create a new test account with timestamp
    const signUpResult = await this.signUp(testEmail, testPassword, 'Test User');
    
    if (signUpResult.success) {
      return signUpResult;
    }
    
    // If signup also fails, try with a different email format
    const altEmail = `user${timestamp}@testmail.com`;
    return this.signUp(altEmail, testPassword, 'Test User');
  }
}

export const productionAuthService = new ProductionAuthService();
export default productionAuthService;