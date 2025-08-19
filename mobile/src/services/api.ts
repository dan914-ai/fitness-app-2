import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from './navigation.service';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expired or invalid - handle gracefully
          try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('refreshToken');
            
            // Navigate to login screen
            if (navigationRef.current?.isReady()) {
              navigationRef.current.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Auth',
                      state: {
                        routes: [{ name: 'Login' }],
                      },
                    },
                  ],
                })
              );
            } else {
              // If navigation is not ready, try again after a delay
              setTimeout(() => {
                if (navigationRef.current?.isReady()) {
                  navigationRef.current.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'Auth',
                          state: {
                            routes: [{ name: 'Login' }],
                          },
                        },
                      ],
                    })
                  );
                }
              }, 500);
            }
          } catch (navigationError) {
            console.error('Error during logout navigation:', navigationError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: any) {
    return this.api.get<T>(url, { params });
  }

  post<T>(url: string, data?: any) {
    return this.api.post<T>(url, data);
  }

  put<T>(url: string, data?: any) {
    return this.api.put<T>(url, data);
  }

  delete<T>(url: string) {
    return this.api.delete<T>(url);
  }
}

export default new ApiService();