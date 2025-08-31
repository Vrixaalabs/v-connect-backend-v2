import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Institute } from '../../models/Institute';
import { InstituteRole } from '../../models/InstituteRole';
import { InstituteUserRole } from '../../models/InstituteUserRole';
import { InstituteJoinRequest } from '../../models/InstituteJoinRequest';
import { User } from '../../models/User';
import { BaseError } from '../../types/errors/base.error';
import { CreateInstituteInput, UpdateInstituteInput } from '../institute/institute.interfaces';

export const superAdminMutations = {
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
    { instituteId, input }: { instituteId: string; input: UpdateInstituteInput },
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
    { input }: { input: { email: string; instituteId: string } },
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
    { adminId }: { adminId: string },
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
