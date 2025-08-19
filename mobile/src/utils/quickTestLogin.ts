import AsyncStorage from '@react-native-async-storage/async-storage';

export async function quickTestLogin() {
  // Create a mock session that the app will recognize
  const mockUser = {
    id: 'test-user-' + Date.now(),
    email: 'test@example.com',
    username: 'TestUser',
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: 'mock-token-' + Date.now(),
    refresh_token: 'mock-refresh-' + Date.now(),
    expires_at: Date.now() + (60 * 60 * 1000), // 1 hour from now
    user: mockUser,
  };

  // Store the mock session
  await AsyncStorage.setItem('mock_auth_session', JSON.stringify(mockSession));
  await AsyncStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
  await AsyncStorage.setItem('using_mock_auth', 'true');
  await AsyncStorage.setItem('user', JSON.stringify(mockUser));
  await AsyncStorage.setItem('authToken', 'mock-token-123');

  return mockSession;
}