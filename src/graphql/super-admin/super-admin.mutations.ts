import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Organization } from '../../models/Organization';
import { OrganizationRole } from '../../models/OrganizationRole';
import { OrganizationUserRole } from '../../models/OrganizationUserRole';
import { OrganizationJoinRequest } from '../../models/OrganizationJoinRequest';
import { User } from '../../models/User';
import { BaseError } from '../../types/errors/base.error';
import { CreateOrganizationInput, UpdateOrganizationInput } from '../organization/organization.interfaces';
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
  BaseResponse,
  UserResponse,
  SuperAdminSettingsResponse,
  OrganizationResponse,
  OrganizationAdminResponse,
  AssignAdminInput,
  RemoveAdminArgs,
  UpdatePasswordArgs,
  UpdateSuperAdminProfileArgs,
  UpdateSuperAdminSettingsArgs,
  SuperAdmin2FAArgs,
  UpdateOrganizationArgs,
} from './super-admin.interfaces';

export const superAdminMutations = {
  superAdminLogin: async (
    _: unknown,
    { email, password }: SuperAdminLoginInput
  ): Promise<SuperAdminAuthResponse> => {
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
        { userId: user.userId, role: user.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn } as SignOptions
      );

      return {
        success: true,
        message: 'Login successful',
        token,
        requiresTwoFactor: false,
        user: {
          userId: user.userId,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
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
    { email, code }: SuperAdmin2FAArgs
  ): Promise<SuperAdminAuthResponse> => {
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
        { userId: user.userId, role: user.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn } as SignOptions
      );

      return {
        success: true,
        message: 'Verification successful',
        token,
        user: {
          userId: user.userId,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
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
  ): Promise<BaseResponse> => {
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
    { input }: UpdateSuperAdminProfileArgs,
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ): Promise<UserResponse> => {
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
          userId: updatedUser.userId,
          email: updatedUser.email,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
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
    { input }: UpdatePasswordArgs,
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ): Promise<BaseResponse> => {
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
    { input }: UpdateSuperAdminSettingsArgs,
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ): Promise<SuperAdminSettingsResponse> => {
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

      if (!updatedUser.settings) {
        throw createError.notFound('Settings not found');
      }

      const { twoFactorCode, ...settings } = updatedUser.settings;

      return {
        success: true,
        message: 'Settings updated successfully',
        settings,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.internal('Failed to update settings', { error });
    }
  },
  createOrganization: async (
    _: unknown,
    { input }: { input: CreateOrganizationInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can create institutes');
      }

      // handle the university name to make it slug
      const slug = input.name.toLowerCase().replace(/ /g, '-');

      const organization = new Organization({
        ...input,
        slug,
      });
      await organization.save();

      // Create default roles
      const defaultRoles = [
        {
          name: 'Admin',
          description: 'Organization administrator with full access',
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
          OrganizationRole.create({
            ...role,
            organizationId: organization.organizationId,
            createdBy: user?.id,
          })
        )
      );

      return {
        success: true,
        message: 'Organization created successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create organization', {
        operation: 'create',
        entityType: 'Organization',
        error,
      });
    }
  },

  updateOrganization: async (
    _: unknown,
    { organizationId, input }: UpdateOrganizationArgs,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can update organizations');
      }

      const organization = await Organization.findOneAndUpdate(
        { organizationId },
        { $set: input },
        { new: true }
      );

      if (!organization) {
        throw createError.notFound(`Organization with ID ${organizationId} not found`, {
          entityType: 'Organization',
          entityId: organizationId,
        });
      }

      return {
        success: true,
        message: 'Organization updated successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update organization', {
        operation: 'update',
        entityType: 'Organization',
        entityId: organizationId,
        error,
      });
    }
  },

  deleteOrganization: async (
    _: unknown,
    { organizationId }: { organizationId: string },
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can delete organizations');
      }

      const organization = await Organization.findOneAndDelete({ organizationId });
      if (!organization) {
        throw createError.notFound(`Organization with ID ${organizationId} not found`, {
          entityType: 'Organization',
          entityId: organizationId,
        });
      }

      // Delete related data
      await Promise.all([
        OrganizationRole.deleteMany({ organizationId }),
        OrganizationUserRole.deleteMany({ organizationId }),
        OrganizationJoinRequest.deleteMany({ organizationId }),
      ]);

      return {
        success: true,
        message: 'Organization deleted successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete organization', {
        operation: 'delete',
        entityType: 'Organization',
        entityId: organizationId,
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
        throw createError.authorization('Only super admin can assign organization admins');
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
      const organization = await Organization.findOne({ organizationId: input.organizationId });
      if (!organization) {
        throw createError.notFound(`Organization with ID ${input.organizationId} not found`, {
          entityType: 'Organization',
          entityId: input.organizationId,
        });
      }

      // Find admin role
      const adminRole = await OrganizationRole.findOne({
        organizationId: input.organizationId,
        name: 'Admin',
      });

      if (!adminRole) {
        throw createError.notFound(`Admin role not found for organization ${input.organizationId}`, {
          entityType: 'OrganizationRole',
          organizationId: input.organizationId,
        });
      }

      // Deactivate any existing active roles
      await OrganizationUserRole.updateMany(
        { organizationId: input.organizationId, userId: targetUser.userId, isActive: true },
        { $set: { isActive: false } }
      );

      // Create new role assignment
      const userRole = await OrganizationUserRole.create({
        organizationId: input.organizationId,
        userId: targetUser.userId,
        roleId: adminRole.roleId,
        assignedBy: user?.id,
        isActive: true,
      });

      return {
        success: true,
        message: 'Organization admin assigned successfully',
        admin: userRole,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to assign organization admin', {
        operation: 'assignAdmin',
        entityType: 'OrganizationUserRole',
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
        throw createError.authorization('Only super admin can remove organization admins');
      }

      const admin = await OrganizationUserRole.findOne({ assignmentId: adminId });
      if (!admin) {
        throw createError.notFound(`Admin with ID ${adminId} not found`, {
          entityType: 'OrganizationUserRole',
          entityId: adminId,
        });
      }

      await OrganizationUserRole.updateOne(
        { assignmentId: adminId },
        { $set: { isActive: false } }
      );

      return {
        success: true,
        message: 'Organization admin removed successfully',
        admin,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to remove organization admin', {
        operation: 'removeAdmin',
        entityType: 'OrganizationUserRole',
        adminId,
        error,
      });
    }
  },
};
