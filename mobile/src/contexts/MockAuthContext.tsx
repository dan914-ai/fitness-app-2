import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMockSession } from '../utils/testAuthWorkaround';

interface MockAuthContextType {
  isMockAuthenticated: boolean;
  setMockAuthenticated: (value: boolean) => void;
  checkMockAuth: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isMockAuthenticated, setIsMockAuthenticated] = useState(false);

  const checkMockAuth = async () => {
    try {
      const mockSession = await getMockSession();
      const usingMockAuth = await AsyncStorage.getItem('using_mock_auth');
      const authToken = await AsyncStorage.getItem('authToken');
      
        hasMockSession: !!mockSession,
        usingMockAuth: usingMockAuth,
        hasAuthToken: !!authToken,
      });
      
      if (mockSession || usingMockAuth === 'true' || authToken === 'mock-token-123') {
        setIsMockAuthenticated(true);
      } else {
        setIsMockAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking mock auth:', error);
      setIsMockAuthenticated(false);
    }
  };

  const setMockAuthenticated = async (value: boolean) => {
    setIsMockAuthenticated(value);
    if (!value) {
      // Clear mock auth
      await AsyncStorage.removeItem('mock_auth_session');
      await AsyncStorage.removeItem('using_mock_auth');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
  };

  useEffect(() => {
    checkMockAuth();
    
    // Check every 500ms for changes
    const interval = setInterval(checkMockAuth, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <MockAuthContext.Provider value={{ isMockAuthenticated, setMockAuthenticated, checkMockAuth }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}