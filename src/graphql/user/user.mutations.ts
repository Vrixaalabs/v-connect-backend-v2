import { Context, IUpdateUserArgs, IVerifyEmailPayload } from '@/graphql/user/user.interface';
import { IUser, User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { securityConfig } from '../../config/app.config';
import { createError } from '../../middleware/errorHandler';
import { BaseError } from '../../types/errors/base.error';
import { generateVerificationToken, verifyVerificationToken } from '@/utils/token.util';
import { TOKEN_VALIDITY } from '@/utils/constant';
import { IVerificationTokenPayload } from '@/graphql/user/user.interface';

export const userMutations = {
  updateUser: async (
    _: unknown,
    args: { id: string; input: IUpdateUserArgs },
    { isAuthenticated }: Context
  ): Promise<{ success: true; user: IUser }> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const updateData: Partial<IUpdateUserArgs> = {};
      for (const [key, value] of Object.entries(args.input)) {
        if (value !== undefined) {
          updateData[key as keyof IUpdateUserArgs] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw createError.validation('No valid fields provided for update');
      }

      const user = await User.findByIdAndUpdate(
        args.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) throw createError.notFound('User not found');

      return { success: true, user };

      // try {
      //     await sesService.sendEmail({
      //         to: "dheerajgogoi2@gmail.com",
      //         templateName: "NotificationEmail",
      //         templateData: {
      //             appName: "Test Project",
      //             userName: user.firstName || "User",
      //             userEmail: "dheerajgogoi2@gmail.com",
      //             notificationType: "Profile Updated",
      //             message: "Your profile details were recently updated.",
      //             actionText: "View Profile",
      //             actionUrl: "#",
      //             supportEmail: "support@yourapp.com",
      //         },
      //     });
      // } catch (emailError) {
      //     logger.warn("Failed to send profile update notification email", emailError);
      // }
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update user', {
        operation: 'update',
        entityType: 'User',
      });
    }
  },
  resetPassword: async (
    _: unknown,
    args: { id: string; newPassword: string },
    { isAuthenticated }: Context
  ): Promise<{ success: true; user: IUser }> => {
    try {
      if (!isAuthenticated)
        throw createError.authentication('Not authenticated');

      const salt = await bcrypt.genSalt(securityConfig.bcryptRounds || 12);
      const hashedPassword = await bcrypt.hash(args.newPassword, salt);
      const user = await User.findByIdAndUpdate(
        args.id,
        { $set: { password: hashedPassword } },
        { new: true }
      );

      if (!user) throw createError.notFound('User not found');

      return { success: true, user };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to reset password', {
        operation: 'reset',
        entityType: 'User',
      });
    }
  },
  verifyEmail: async (
    _: unknown,
    args: { token: string },
    context : Context
  ): Promise<IVerifyEmailPayload> => {
    try {
      if (!context.isAuthenticated)
        throw createError.authentication('Not authenticated');

      console.log('args.token', args.token);
      let decoded: IVerificationTokenPayload | null = null;
      try {
        decoded = verifyVerificationToken(args.token);
      } catch (error) {
        return { 
          success: false,
          message: 'Invalid verification token',
          user: null
        };
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          user: null
        }
      }

      if (user.isVerified) {
        return {
          success: false,
          message: 'User already verified',
          user: null
        }
      }
      
      if (user.verificationToken !== args.token || user.verificationToken === '') {
        return {
          success: false,
          message: 'Invalid verification token',
          user: null
        }
      }

      user.isVerified = true;
      user.verificationToken = '';
      await user.save();

      return { 
        success: true, 
        message: 'Email verified successfully',
        user: user
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to verify email', {
        operation: 'verify',
        entityType: 'User',
      });
    }
  },
  resendVerificationEmail: async (
    _: unknown,
    args: { email: string },
    context : Context
  ): Promise<{ success: true; user: IUser }> => {
    try {
      if (!context.isAuthenticated)
        throw createError.authentication('Not authenticated');

      const user = await User.findOne({ email: args.email });
      if (!user) throw createError.notFound('User not found');

      user.verificationToken = generateVerificationToken({ email: args.email }, TOKEN_VALIDITY);
      await user.save();

      return { success: true, user };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to resend verification email', {
        operation: 'resend',
        entityType: 'User',
      });
    }
  },
};
