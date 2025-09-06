import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/app.config';
import {
  clearRefreshTokenCookie,
  generateTokens,
  revokeRefreshToken,
  setRefreshTokenCookie,
  verifyAccessToken,
} from '../middleware/authMiddleware';
import { Role } from '../models/Role';
import { IUser, User } from '../models/User';
import { parseTimeString } from '../utils/timeUtils';
import mongoose from 'mongoose';

// Predefined credentials for super admin creation
// These should be set in environment variables in production
const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || 'thisisasecretkey';
const SUPER_ADMIN_VERIFICATION_ID = process.env.SUPER_ADMIN_VERIFICATION_ID || 'admin@vconnect.com';
const SUPER_ADMIN_VERIFICATION_PASSWORD = process.env.SUPER_ADMIN_VERIFICATION_PASSWORD || 'admin123';

const router = Router();

interface RefreshTokenBody {
  refreshToken: string;
}

interface RegisterBody {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface CreateSuperAdminBody {
  verificationId: string;
  verificationPassword: string;
  secretKey: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

// Register endpoint
router.post(
  '/register',
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    // Start a new session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { email, password, username, firstName, lastName } = req.body;

      // Validate request body
      if (
        !email ||
        !password ||
        !username ||
        !firstName ||
        !lastName
      ) {
        await session.endSession();
        return res.status(400).json({
          message:
            'All fields are required: email, password, username, firstName, lastName',
        });
      }

      // Check if user already exists - do this outside transaction as it's just a read
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      });

      if (existingUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          message: 'User with this email or username already exists',
        });
      }
      // Get admin role - do this outside transaction as it's just a read
      const memberRole = await Role.findOne({ name: 'Member' });
      if (!memberRole) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          message:
            'Required roles not found. Please run system initialization.',
        });
      }

      // Create new user within transaction
      const users = await User.create(
        [
          {
            email: email.toLowerCase(),
            password,
            username: username.toLowerCase(),
            firstName,
            lastName,
          },
        ],
        { session }
      );

      const user = users[0];
      if (!user) {
        throw new Error('Failed to create user');
      }

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user.userId);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      // Set refresh token in HttpOnly cookie
      setRefreshTokenCookie(res, refreshToken);

      // Return only the access token in response
      return res.status(201).json({
        accessToken,
        user: {
          userId: user.userId,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Login endpoint
router.post(
  '/login',
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate request body
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Get client info for audit trail
      const ip = req.ip || req.connection.remoteAddress || undefined;
      const userAgent = req.get('User-Agent');

      // Generate tokens with client info
      const { accessToken, refreshToken } = await generateTokens(
        user.userId,
        ip,
        userAgent
      );

      // Set refresh token in HttpOnly cookie
      setRefreshTokenCookie(res, refreshToken);

      // Return only the access token in response
      return res.json({
        accessToken,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Get authenticated user info
router.get('/me', verifyAccessToken, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post(
  '/logout',
  verifyAccessToken,
  async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }

      clearRefreshTokenCookie(res);

      return res.json({
        message: 'Successfully logged out',
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Refresh token endpoint
router.post(
  '/refresh',
  async (req: Request<{}, {}, RefreshTokenBody>, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const ip = req.ip || req.connection.remoteAddress || undefined;
      const userAgent = req.get('User-Agent');

      const { TokenService } = await import('../services/tokenService');

      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as unknown as { userId: string; type: string };

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid token type' });
      }

      const { token: newRefreshToken } = await TokenService.rotateRefreshToken(
        refreshToken,
        decoded.userId,
        ip,
        userAgent
      );

      const accessToken = jwt.sign(
        { userId: decoded.userId, type: 'access' },
        config.jwt.accessSecret as jwt.Secret,
        { expiresIn: config.jwt.accessExpiresIn || '15m' } as jwt.SignOptions
      );

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: config.app.environment === 'production',
        sameSite: 'strict',
        maxAge: parseTimeString(config.jwt.refreshExpiresIn || '30d'),
        path: '/api/auth/refresh',
      });

      return res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Token reuse detected - security compromised') {
          res.clearCookie('refreshToken', {
            path: '/api/auth/refresh',
          });
          return res.status(401).json({
            message: 'Security compromised - please login again',
            code: 'TOKEN_REUSE_DETECTED',
          });
        }
        if (
          error.message === 'Invalid token type' ||
          error.message === 'User not found' ||
          error.message === 'Invalid or expired refresh token'
        ) {
          return res.status(401).json({ message: error.message });
        }
      }
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
);

// Create super admin endpoint
router.post(
  '/create-super-admin',
  async (req: Request<{}, {}, CreateSuperAdminBody>, res: Response) => {
    // Start a new session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        verificationId,
        verificationPassword,
        secretKey,
        email,
        password,
        username,
        firstName,
        lastName,
      } = req.body;

      // Verify the predefined credentials
      if (
        verificationId !== SUPER_ADMIN_VERIFICATION_ID ||
        verificationPassword !== SUPER_ADMIN_VERIFICATION_PASSWORD ||
        secretKey !== SUPER_ADMIN_SECRET
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(401).json({
          message: 'Invalid verification credentials',
        });
      }

      // Validate request body
      if (!email || !password || !username || !firstName || !lastName) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message:
            'All fields are required: email, password, username, firstName, lastName',
        });
      }

      // Check if super admin already exists
      const existingSuperAdmin = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
        role: 'super_admin',
      });

      if (existingSuperAdmin) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          message: 'Super admin with this email or username already exists',
        });
      }

      // Create new super admin user within transaction
      const users = await User.create(
        [
          {
            email: email.toLowerCase(),
            password, // Let the User model's pre-save hook handle password hashing
            username: username.toLowerCase(),
            firstName,
            lastName,
            role: 'super_admin',
            isVerified: true, // Super admin is automatically verified
            settings: {
              emailNotifications: true,
              twoFactorAuth: true, // Enable 2FA by default for super admin
              maintenanceMode: false,
              notifyOnNewInstitute: true,
              notifyOnSystemAlerts: true,
              notifyOnSecurityAlerts: true,
            },
          },
        ],
        { session }
      );

      const user = users[0];
      if (!user) {
        throw new Error('Failed to create super admin user');
      }

      // Generate tokens with extended expiry for first login
      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(
        user.userId,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Set refresh token in HttpOnly cookie
      setRefreshTokenCookie(res, refreshToken);

      // Return success response with access token and user info
      return res.status(201).json({
        message: 'Super admin created successfully',
        accessToken,
        user: {
          userId: user.userId,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      session.endSession();

      // Log the error for debugging but don't expose details
      console.error('Super admin creation error:', error);

      return res.status(500).json({
        message: 'Failed to create super admin. Please try again later.',
      });
    }
  }
);

export default router;
