import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Institute } from '../../models/Institute';
import { InstituteRole } from '../../models/InstituteRole';
import { InstituteUserRole } from '../../models/InstituteUserRole';
import { InstituteJoinRequest } from '../../models/InstituteJoinRequest';
import { User } from '../../models/User';
import { BaseError } from '../../types/errors/base.error';
import { CreateInstituteInput, UpdateInstituteInput } from '../institute/institute.interfaces';
import { compare, hash } from 'bcryptjs';
import { sign, SignOptions } from 'jsonwebtoken';
import { config } from '../../config/app.config';
import {
  SuperAdminLoginInput,
  SuperAdmin2FAInput,
  UpdateSuperAdminProfileInput,
  UpdatePasswordInput,
  UpdateSuperAdminSettingsInput,
  SuperAdminAuthResponse,
  BasicResponse,
  UserResponse,
  SuperAdminSettingsResponse,
  InstituteResponse,
  InstituteAdminResponse,
  AssignAdminInput,
  UpdateInstituteArgs,
  RemoveAdminArgs,
} from './super-admin.interfaces';

export const superAdminMutations = {
  superAdminLogin: async (
    _: unknown,
    { email, password }: SuperAdminLoginInput
  ) => {
    try {
      console.log('Login attempt for email:', email);
      console.log('Provided password:', password);

      const user = await User.findOne({ email, role: 'super_admin' });
      console.log('Found user:', user ? 'Yes' : 'No');
      
      if (!user) {
        throw createError.authentication('Invalid credentials');
      }

      console.log('Stored hashed password:', user.password);
      
      // Try both the model method and direct comparison
      const isValidModel = await user.comparePassword(password);
      console.log('isValidModel:', isValidModel);
      
      const isValidDirect = await compare(password, user.password);
      console.log('isValidDirect:', isValidDirect);

      if (!isValidModel && !isValidDirect) {
        throw createError.authentication('Invalid credentials');
      }

      // Check if 2FA is enabled
      // if (user.settings?.twoFactorAuth) {
      //   // Generate and send 2FA code
      //   const code = Math.floor(100000 + Math.random() * 900000).toString();
      //   await User.updateOne({ _id: user._id }, { 'settings.twoFactorCode': code });
      //   // TODO: Send code via email

      //   return {
      //     success: true,
      //     message: '2FA code sent to your email',
      //     requiresTwoFactor: true,
      //   };
      // }

      // If 2FA is not enabled, generate token
      const token = sign(
        { userId: user._id, role: user.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn } as SignOptions
      );

      return {
        success: true,
        message: 'Login successful',
        token,
        requiresTwoFactor: false,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Login failed', error);
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Login failed', { error });
    }
  },

  verifySuperAdmin2FA: async (
    _: unknown,
    { email, code }: SuperAdmin2FAInput
  ) => {
    try {
      const user = await User.findOne({ 
        email, 
        role: 'super_admin',
        'settings.twoFactorCode': code,
      });

      if (!user) {
        throw createError.authentication('Invalid verification code');
      }

      // Clear 2FA code
      await User.updateOne(
        { _id: user._id },
        { $unset: { 'settings.twoFactorCode': 1 } }
      );

      // Generate token
      const token = sign(
        { userId: user._id, role: user.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn } as SignOptions
      );

      return {
        success: true,
        message: 'Verification successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Verification failed', { error });
    }
  },

  superAdminLogout: async (
    _: unknown,
    __: unknown,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authentication('Not authenticated');
      }

      // In a real implementation, you might want to invalidate the token
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Logout failed', { error });
    }
  },

  updateSuperAdminProfile: async (
    _: unknown,
    { input }: { input: UpdateSuperAdminProfileInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authentication('Not authenticated');
      }

      const updatedUser = await User.findByIdAndUpdate(
        user?.id,
        { $set: input },
        { new: true }
      );

      if (!updatedUser) {
        throw createError.notFound('User not found');
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
        },
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Failed to update profile', { error });
    }
  },

  updateSuperAdminPassword: async (
    _: unknown,
    { input }: { input: UpdatePasswordInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authentication('Not authenticated');
      }

      const currentUser = await User.findById(user?.id);
      if (!currentUser) {
        throw createError.notFound('User not found');
      }

      const isValid = await compare(input.currentPassword, currentUser.password);
      if (!isValid) {
        throw createError.authentication('Current password is incorrect');
      }

      const hashedPassword = await hash(input.newPassword, 12);
      await User.updateOne(
        { _id: user?.id },
        { $set: { password: hashedPassword } }
      );

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Failed to update password', { error });
    }
  },

  updateSuperAdminSettings: async (
    _: unknown,
    { input }: { input: UpdateSuperAdminSettingsInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authentication('Not authenticated');
      }

      const updatedUser = await User.findByIdAndUpdate(
        user?.id,
        { $set: { settings: input } },
        { new: true }
      );

      if (!updatedUser) {
        throw createError.notFound('User not found');
      }

      return {
        success: true,
        message: 'Settings updated successfully',
        settings: updatedUser.settings,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Failed to update settings', { error });
    }
  },
  createInstitute: async (
    _: unknown,
    { input }: { input: CreateInstituteInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can create institutes');
      }

      const institute = new Institute({
        ...input,
      });
      await institute.save();

      // Create default roles
      const defaultRoles = [
        {
          name: 'Admin',
          description: 'Institute administrator with full access',
          permissions: ['MANAGE_ROLES', 'MANAGE_USERS', 'MANAGE_DEPARTMENTS', 'MANAGE_REQUESTS'],
          isDefault: true,
        },
        {
          name: 'Faculty',
          description: 'Faculty member with limited access',
          permissions: ['VIEW_USERS', 'VIEW_DEPARTMENTS'],
          isDefault: true,
        },
        {
          name: 'Student',
          description: 'Student with basic access',
          permissions: ['VIEW_DEPARTMENTS'],
          isDefault: true,
        },
      ];

      await Promise.all(
        defaultRoles.map(role =>
          InstituteRole.create({
            ...role,
            instituteId: institute.instituteId,
            createdBy: user?.id,
          })
        )
      );

      return {
        success: true,
        message: 'Institute created successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create institute', {
        operation: 'create',
        entityType: 'Institute',
        error,
      });
    }
  },

  updateInstitute: async (
    _: unknown,
    { instituteId, input }: UpdateInstituteArgs,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can update institutes');
      }

      const institute = await Institute.findOneAndUpdate(
        { instituteId },
        { $set: input },
        { new: true }
      );

      if (!institute) {
        throw createError.notFound(`Institute with ID ${instituteId} not found`, {
          entityType: 'Institute',
          entityId: instituteId,
        });
      }

      return {
        success: true,
        message: 'Institute updated successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update institute', {
        operation: 'update',
        entityType: 'Institute',
        entityId: instituteId,
        error,
      });
    }
  },

  deleteInstitute: async (
    _: unknown,
    { instituteId }: { instituteId: string },
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can delete institutes');
      }

      const institute = await Institute.findOneAndDelete({ instituteId });
      if (!institute) {
        throw createError.notFound(`Institute with ID ${instituteId} not found`, {
          entityType: 'Institute',
          entityId: instituteId,
        });
      }

      // Delete related data
      await Promise.all([
        InstituteRole.deleteMany({ instituteId }),
        InstituteUserRole.deleteMany({ instituteId }),
        InstituteJoinRequest.deleteMany({ instituteId }),
      ]);

      return {
        success: true,
        message: 'Institute deleted successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete institute', {
        operation: 'delete',
        entityType: 'Institute',
        entityId: instituteId,
        error,
      });
    }
  },

  assignAdmin: async (
    _: unknown,
    { input }: { input: AssignAdminInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can assign institute admins');
      }

      // Find user by email
      const targetUser = await User.findOne({ email: input.email });
      if (!targetUser) {
        throw createError.notFound(`User with email ${input.email} not found`, {
          entityType: 'User',
          email: input.email,
        });
      }

      // Find institute
      const institute = await Institute.findOne({ instituteId: input.instituteId });
      if (!institute) {
        throw createError.notFound(`Institute with ID ${input.instituteId} not found`, {
          entityType: 'Institute',
          entityId: input.instituteId,
        });
      }

      // Find admin role
      const adminRole = await InstituteRole.findOne({
        instituteId: input.instituteId,
        name: 'Admin',
      });

      if (!adminRole) {
        throw createError.notFound(`Admin role not found for institute ${input.instituteId}`, {
          entityType: 'InstituteRole',
          instituteId: input.instituteId,
        });
      }

      // Deactivate any existing active roles
      await InstituteUserRole.updateMany(
        { instituteId: input.instituteId, userId: targetUser.userId, isActive: true },
        { $set: { isActive: false } }
      );

      // Create new role assignment
      const userRole = await InstituteUserRole.create({
        instituteId: input.instituteId,
        userId: targetUser.userId,
        roleId: adminRole.roleId,
        assignedBy: user?.id,
        isActive: true,
      });

      return {
        success: true,
        message: 'Institute admin assigned successfully',
        admin: userRole,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to assign institute admin', {
        operation: 'assignAdmin',
        entityType: 'InstituteUserRole',
        error,
      });
    }
  },

  removeAdmin: async (
    _: unknown,
    { adminId }: RemoveAdminArgs,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can remove institute admins');
      }

      const admin = await InstituteUserRole.findOne({ assignmentId: adminId });
      if (!admin) {
        throw createError.notFound(`Admin with ID ${adminId} not found`, {
          entityType: 'InstituteUserRole',
          entityId: adminId,
        });
      }

      await InstituteUserRole.updateOne(
        { assignmentId: adminId },
        { $set: { isActive: false } }
      );

      return {
        success: true,
        message: 'Institute admin removed successfully',
        admin,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to remove institute admin', {
        operation: 'removeAdmin',
        entityType: 'InstituteUserRole',
        adminId,
        error,
      });
    }
  },
};
