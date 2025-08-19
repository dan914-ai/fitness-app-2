/**
 * Test configuration - loads from environment variables
 * Never hardcode credentials in source code
 */

export const getTestCredentials = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test credentials should not be used in production');
  }

  // Read from environment variables only
  return {
    email: process.env.EXPO_PUBLIC_TEST_EMAIL || '',
    password: process.env.EXPO_PUBLIC_TEST_PASSWORD || '',
  };
};

export const isTestMode = () => {
  return process.env.EXPO_PUBLIC_ENV === 'test' || process.env.NODE_ENV === 'test';
};