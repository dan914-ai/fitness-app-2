import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        throw new AppError('All fields are required', 400);
      }

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        throw new AppError('User already exists', 409);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash
        },
        select: {
          userId: true,
          username: true,
          email: true,
          userTier: true,
          createdAt: true
        }
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.userId.toString(), email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          ...user,
          userId: user.userId.toString()
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.userId.toString(), email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.json({
        message: 'Login successful',
        user: {
          userId: user.userId.toString(),
          username: user.username,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          userTier: user.userTier,
          totalPoints: user.totalPoints
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Token is required', 400);
      }

      // Verify old token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as { userId: string; email: string };

      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.json({
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (error) {
      next(error);
    }
  }
}