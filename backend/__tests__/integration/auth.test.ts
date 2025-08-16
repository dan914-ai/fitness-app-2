import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

const prisma = new PrismaClient();

describe('Auth API Integration Tests', () => {
  // Clean up test data
  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@test.com'
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser123',
        email: 'testuser123@test.com',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('userId');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
    });

    it('should fail to register with missing fields', async () => {
      const incompleteData = {
        username: 'testuser456',
        // missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'All fields are required');
    });

    it('should fail to register duplicate user', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'duplicate@test.com',
        password: 'Test@123'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create a test user for login tests
      const userData = {
        username: 'loginuser',
        email: 'loginuser@test.com',
        password: 'Test@123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'loginuser@test.com',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('userId');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should fail login with invalid password', async () => {
      const loginData = {
        email: 'loginuser@test.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail login with missing fields', async () => {
      const incompleteData = {
        email: 'loginuser@test.com',
        // missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const loginData = {
        email: 'loginuser@test.com',
        password: 'Test@123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      validToken = response.body.token;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ token: validToken })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(validToken);
    });

    it('should fail to refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Token is required');
    });

    it('should fail to refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ token: 'invalid-token' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});