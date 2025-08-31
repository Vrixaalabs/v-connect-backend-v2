import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Institute } from '../../models/Institute';
import { InstituteRole } from '../../models/InstituteRole';
import { InstituteUserRole } from '../../models/InstituteUserRole';
import { InstituteJoinRequest } from '../../models/InstituteJoinRequest';
import {
  CreateInstituteInput,
  UpdateInstituteInput,
  CreateInstituteRoleInput,
  UpdateInstituteRoleInput,
  CreateJoinRequestInput,
} from './institute.interfaces';
import { BaseError } from '../../types/errors/base.error';

import { User } from '../../models/User';

export const instituteMutations = {
  followInstitute: async (
    _: unknown,
    { instituteId }: { instituteId: string },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const institute = await Institute.findOneAndUpdate(
        { instituteId },
        { $addToSet: { followers: user?.id } },
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
        message: 'Institute followed successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to follow institute', {
        operation: 'follow',
        entityType: 'Institute',
        entityId: instituteId,
        error,
      });
    }
  },

  unfollowInstitute: async (
    _: unknown,
    { instituteId }: { instituteId: string },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const institute = await Institute.findOneAndUpdate(
        { instituteId },
        { $pull: { followers: user?.id } },
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
        message: 'Institute unfollowed successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to unfollow institute', {
        operation: 'unfollow',
        entityType: 'Institute',
        entityId: instituteId,
        error,
      });
    }
  },

  createInstituteRole: async (
    _: unknown,
    { instituteId, input }: { instituteId: string; input: CreateInstituteRoleInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await InstituteRole.create({
        ...input,
        instituteId,
        createdBy: user?.id,
      });

      return {
        success: true,
        message: 'Institute role created successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create institute role', {
        operation: 'create',
        entityType: 'InstituteRole',
        instituteId,
        error,
      });
    }
  },

  updateInstituteRole: async (
    _: unknown,
    { roleId, input }: { roleId: string; input: UpdateInstituteRoleInput },
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await InstituteRole.findOneAndUpdate(
        { roleId },
        { $set: input },
        { new: true }
      );

      if (!role) {
        throw createError.notFound(`Role with ID ${roleId} not found`, {
          entityType: 'InstituteRole',
          entityId: roleId,
        });
      }

      return {
        success: true,
        message: 'Institute role updated successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update institute role', {
        operation: 'update',
        entityType: 'InstituteRole',
        roleId,
        error,
      });
    }
  },

  deleteInstituteRole: async (
    _: unknown,
    { roleId }: { roleId: string },
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await InstituteRole.findOne({ roleId });
      if (!role) {
        throw createError.notFound(`Role with ID ${roleId} not found`, {
          entityType: 'InstituteRole',
          entityId: roleId,
        });
      }

      if (role.isDefault) {
        throw createError.validation('Cannot delete default roles', {
          field: 'roleId',
        });
      }

      await InstituteRole.deleteOne({ roleId });
      await InstituteUserRole.deleteMany({ roleId });

      return {
        success: true,
        message: 'Institute role deleted successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete institute role', {
        operation: 'delete',
        entityType: 'InstituteRole',
        roleId,
        error,
      });
    }
  },

  assignInstituteRole: async (
    _: unknown,
    { instituteId, userId, roleId, departmentId }: { instituteId: string; userId: string; roleId: string; departmentId?: string },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Deactivate any existing active roles
      await InstituteUserRole.updateMany(
        { instituteId, userId, isActive: true },
        { $set: { isActive: false } }
      );

      // Create new role assignment
      const userRole = await InstituteUserRole.create({
        instituteId,
        userId: user?.id,
        roleId,
        departmentId,
        assignedBy: user?.id,
        isActive: true,
      });

      const role = await InstituteRole.findOne({ roleId });

      return {
        success: true,
        message: 'Institute role assigned successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to assign institute role', {
        operation: 'assign',
        entityType: 'InstituteUserRole',
        userId: user?.id,
        roleId,
        error,
      });
    }
  },

  removeInstituteRole: async (
    _: unknown,
    { instituteId, userId }: { instituteId: string; userId: string },
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      await InstituteUserRole.updateMany(
        { instituteId, userId, isActive: true },
        { $set: { isActive: false } }
      );

      return {
        success: true,
        message: 'Institute role removed successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to remove institute role', {
        operation: 'remove',
        entityType: 'InstituteUserRole',
        userId,
        error,
      });
    }
  },

  createJoinRequest: async (
    _: unknown,
    { input }: { input: CreateJoinRequestInput },
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Check if user already has a pending request
      const existingRequest = await InstituteJoinRequest.findOne({
        instituteId: input.instituteId,
        userId: user?.id,
        status: 'pending',
      });

      if (existingRequest) {
        throw createError.validation('You already have a pending join request', {
          field: 'instituteId',
        });
      }

      const request = await InstituteJoinRequest.create({
        ...input,
        userId: user?.id,
        status: 'pending',
      });

      return {
        success: true,
        message: 'Join request created successfully',
        request,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create join request', {
        operation: 'create',
        entityType: 'InstituteJoinRequest',
        error,
      });
    }
  },
};
