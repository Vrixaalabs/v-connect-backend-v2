import { Context } from '../context';
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

export const instituteMutations = {
  createInstitute: async (
    _: unknown,
    { input }: { input: CreateInstituteInput },
    { isAuthenticated, userId }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Check if user is super admin
      // TODO: Add super admin check

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
            createdBy: userId,
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
    { isAuthenticated }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
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
    { isAuthenticated }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
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

  followInstitute: async (
    _: unknown,
    { instituteId }: { instituteId: string },
    { isAuthenticated, userId }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const institute = await Institute.findOneAndUpdate(
        { instituteId },
        { $addToSet: { followers: userId } },
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
    { isAuthenticated, userId }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const institute = await Institute.findOneAndUpdate(
        { instituteId },
        { $pull: { followers: userId } },
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
    { isAuthenticated, userId }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await InstituteRole.create({
        ...input,
        instituteId,
        createdBy: userId,
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
    { isAuthenticated }: Context
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
    { isAuthenticated }: Context
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

      await role.remove();
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
    { isAuthenticated, userId: currentUserId }: Context
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
        userId,
        roleId,
        departmentId,
        assignedBy: currentUserId,
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
        userId,
        roleId,
        error,
      });
    }
  },

  removeInstituteRole: async (
    _: unknown,
    { instituteId, userId }: { instituteId: string; userId: string },
    { isAuthenticated }: Context
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
    { isAuthenticated, userId }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Check if user already has a pending request
      const existingRequest = await InstituteJoinRequest.findOne({
        instituteId: input.instituteId,
        userId,
        status: 'pending',
      });

      if (existingRequest) {
        throw createError.validation('You already have a pending join request', {
          field: 'instituteId',
        });
      }

      const request = await InstituteJoinRequest.create({
        ...input,
        userId,
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

  approveJoinRequest: async (
    _: unknown,
    { requestId }: { requestId: string },
    { isAuthenticated, userId }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const request = await InstituteJoinRequest.findOneAndUpdate(
        { requestId, status: 'pending' },
        {
          $set: {
            status: 'approved',
            approvedBy: userId,
          },
        },
        { new: true }
      );

      if (!request) {
        throw createError.notFound(`Join request with ID ${requestId} not found`, {
          entityType: 'InstituteJoinRequest',
          entityId: requestId,
        });
      }

      // Get student role
      const studentRole = await InstituteRole.findOne({
        instituteId: request.instituteId,
        name: 'Student',
      });

      if (!studentRole) {
        throw createError.notFound('Student role not found', {
          entityType: 'InstituteRole',
          instituteId: request.instituteId,
        });
      }

      // Assign student role
      await InstituteUserRole.create({
        instituteId: request.instituteId,
        userId: request.userId,
        roleId: studentRole.roleId,
        departmentId: request.departmentId,
        assignedBy: userId,
        isActive: true,
      });

      return {
        success: true,
        message: 'Join request approved successfully',
        request,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to approve join request', {
        operation: 'approve',
        entityType: 'InstituteJoinRequest',
        requestId,
        error,
      });
    }
  },

  rejectJoinRequest: async (
    _: unknown,
    { requestId, reason }: { requestId: string; reason: string },
    { isAuthenticated }: Context
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const request = await InstituteJoinRequest.findOneAndUpdate(
        { requestId, status: 'pending' },
        {
          $set: {
            status: 'rejected',
            rejectionReason: reason,
          },
        },
        { new: true }
      );

      if (!request) {
        throw createError.notFound(`Join request with ID ${requestId} not found`, {
          entityType: 'InstituteJoinRequest',
          entityId: requestId,
        });
      }

      return {
        success: true,
        message: 'Join request rejected successfully',
        request,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to reject join request', {
        operation: 'reject',
        entityType: 'InstituteJoinRequest',
        requestId,
        error,
      });
    }
  },
};
