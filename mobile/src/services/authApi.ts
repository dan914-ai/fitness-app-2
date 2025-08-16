import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  experienceLevel: string;
  userGoals: string;
}

interface AuthResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    username: string;
    profileImageUrl?: string;
    userTier: string;
  };
}

interface UserProfile {
  userId: string;
  email: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  height?: number;
  weight?: number;
  profileImageUrl?: string;
  bio?: string;
  experienceLevel: string;
  userGoals: string;
  userTier: string;
  totalPoints: number;
  createdAt: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize auth state from storage
  async initialize(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Failed to load auth token:', error);
    }
  }

  // Login
  async login(params: LoginParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Save token
      await this.setToken(data.token);
      
      // Save user data
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Register
  async register(params: RegisterParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      // Save token
      await this.setToken(data.token);
      
      // Save user data
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Clear local data
      await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
      this.token = null;
      
      // Optionally call logout endpoint
      // await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
      //   method: 'POST',
      //   headers: await this.getAuthHeaders(),
      // });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.PROFILE}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update stored user data
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  // Get auth headers
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Token management
  private async setToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem('@auth_token', token);
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('@auth_token');
    }
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('@auth_token');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Get stored user data
  async getStoredUserData(): Promise<any> {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get stored user data:', error);
      return null;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;