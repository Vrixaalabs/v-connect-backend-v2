import { createError } from '@/middleware/errorHandler';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../../config/app.config';
import { BaseError } from '../../types/errors/base.error';
import { Context, ICheckEmailVerificationPayload, IMockToken } from './user.interface';
import { User } from '@/models/User';

export const userQueries = {
  getMockAuthToken: async (
    _: unknown,
    args: { userId: string }
  ): Promise<IMockToken> => {
    try {
      const options = { expiresIn: '30m' } as SignOptions;
      const newToken = jwt.sign(
        { userId: args.userId },
        config.jwt.accessSecret as jwt.Secret,
        options
      );

      return {
        success: true,
        newToken,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get mock token', {
        operation: 'get',
        entityType: 'User',
      });
    }
  },
  checkEmailVerification: async (
    _: unknown,
    args: { email: string },
    context: Context
  ): Promise<ICheckEmailVerificationPayload> => {
    if (!context.isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        return { success: false, user: null, message: 'User not found' };
      }

      if (user.isVerified) {
        return { success: true, user, message: 'User is verified' };
      }

      return { success: false, user: null, message: 'User is not verified' };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to check email verification', {
        operation: 'checkEmailVerification',
        entityType: 'User',
      });
    }
  },
};
