// Jest setup file
// Add any global test setup here

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://fitness_user:fitness_password@localhost:5432/korean_fitness_test?schema=public';

// Increase timeout for database operations
jest.setTimeout(30000);