import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { mockApi } from './mock.service';

// Check if we should use mock data (when backend is not available)
const USE_MOCK_DATA = false; // Set to false when backend is ready

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// Generic API request function
export const makeRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
) => {
  try {
    const response = await api({
      method,
      url,
      data,
    });
    return response;
  } catch (error) {
    console.error(`API ${method} request failed:`, error);
    throw error;
  }
};

// Export both real API and mock API
export default api;
export { USE_MOCK_DATA, mockApi };