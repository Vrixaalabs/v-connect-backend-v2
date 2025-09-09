import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Organization } from '../../models/Organization';
import { OrganizationRole } from '../../models/OrganizationRole';
import { OrganizationUserRole } from '../../models/OrganizationUserRole';
import { OrganizationJoinRequest } from '../../models/OrganizationJoinRequest';
import {
  FollowOrganizationArgs,
  UnfollowOrganizationArgs,
  CreateOrganizationRoleArgs,
  UpdateOrganizationRoleArgs,
  DeleteOrganizationRoleArgs,
  AssignOrganizationRoleArgs,
  RemoveOrganizationRoleArgs,
  CreateJoinRequestArgs,
  OrganizationResponse,
  OrganizationRoleResponse,
  JoinRequestResponse,
} from './organization.interfaces';
import { BaseError } from '../../types/errors/base.error';

export const organizationMutations = {
  followOrganization: async (
    _: unknown,
    { organizationId }: FollowOrganizationArgs,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<OrganizationResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const organization = await Organization.findOneAndUpdate(
        { organizationId },
        { $addToSet: { followers: user?.id } },
        { new: true }
      );

      if (!organization) {
        throw createError.notFound(
          `Organization with ID ${organizationId} not found`,
          {
            entityType: 'Organization',
            entityId: organizationId,
          }
        );
      }

      return {
        success: true,
        message: 'Organization followed successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to follow organization', {
        operation: 'follow',
        entityType: 'Organization',
        entityId: organizationId,
        error,
      });
    }
  },

  unfollowOrganization: async (
    _: unknown,
    { organizationId }: UnfollowOrganizationArgs,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<OrganizationResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const organization = await Organization.findOneAndUpdate(
        { organizationId },
        { $pull: { followers: user?.id } },
        { new: true }
      );

      if (!organization) {
        throw createError.notFound(
          `Organization with ID ${organizationId} not found`,
          {
            entityType: 'Organization',
            entityId: organizationId,
          }
        );
      }

      return {
        success: true,
        message: 'Institute unfollowed successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to unfollow institute', {
        operation: 'unfollow',
        entityType: 'Organization',
        entityId: organizationId,
        error,
      });
    }
  },

  createOrganizationRole: async (
    _: unknown,
    { organizationId, input }: CreateOrganizationRoleArgs,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<OrganizationRoleResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await OrganizationRole.create({
        ...input,
        organizationId,
        createdBy: user?.id,
      });

      return {
        success: true,
        message: 'Organization role created successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create organization role', {
        operation: 'create',
        entityType: 'OrganizationRole',
        organizationId,
        error,
      });
    }
  },

  updateOrganizationRole: async (
    _: unknown,
    { roleId, input }: UpdateOrganizationRoleArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationRoleResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await OrganizationRole.findOneAndUpdate(
        { roleId },
        { $set: input },
        { new: true }
      );

      if (!role) {
        throw createError.notFound(`Role with ID ${roleId} not found`, {
          entityType: 'OrganizationRole',
          entityId: roleId,
        });
      }

      return {
        success: true,
        message: 'Organization role updated successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update organization role', {
        operation: 'update',
        entityType: 'OrganizationRole',
        roleId,
        error,
      });
    }
  },

  deleteOrganizationRole: async (
    _: unknown,
    { roleId }: DeleteOrganizationRoleArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationRoleResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const role = await OrganizationRole.findOne({ roleId });
      if (!role) {
        throw createError.notFound(`Role with ID ${roleId} not found`, {
          entityType: 'OrganizationRole',
          entityId: roleId,
        });
      }

      if (role.isDefault) {
        throw createError.validation('Cannot delete default roles', {
          field: 'roleId',
        });
      }

      await OrganizationRole.deleteOne({ roleId });
      await OrganizationUserRole.deleteMany({ roleId });

      return {
        success: true,
        message: 'Organization role deleted successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete organization role', {
        operation: 'delete',
        entityType: 'OrganizationRole',
        roleId,
        error,
      });
    }
  },

  assignOrganizationRole: async (
    _: unknown,
    {
      organizationId,
      userId,
      roleId,
      departmentId,
    }: AssignOrganizationRoleArgs,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<OrganizationRoleResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Deactivate any existing active roles
      await OrganizationUserRole.updateMany(
        { organizationId, userId, isActive: true },
        { $set: { isActive: false } }
      );

      // Create new role assignment
      await OrganizationUserRole.create({
        organizationId,
        userId: user?.id,
        roleId,
        departmentId,
        assignedBy: user?.id,
        isActive: true,
      });

      const role = await OrganizationRole.findOne({ roleId });
      if (!role) {
        throw createError.notFound(`Role with ID ${roleId} not found`, {
          entityType: 'OrganizationRole',
          entityId: roleId,
        });
      }

      return {
        success: true,
        message: 'Organization role assigned successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to assign organization role', {
        operation: 'assign',
        entityType: 'InstituteUserRole',
        userId: user?.id,
        roleId,
        error,
      });
    }
  },

  removeOrganizationRole: async (
    _: unknown,
    { organizationId, userId }: RemoveOrganizationRoleArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationRoleResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      await OrganizationUserRole.updateMany(
        { organizationId, userId, isActive: true },
        { $set: { isActive: false } }
      );

      return {
        success: true,
        message: 'Organization role removed successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to remove organization role', {
        operation: 'remove',
        entityType: 'OrganizationUserRole',
        userId,
        error,
      });
    }
  },

  createJoinRequest: async (
    _: unknown,
    { input }: CreateJoinRequestArgs,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<JoinRequestResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Check if user already has a pending request
      const existingRequest = await OrganizationJoinRequest.findOne({
        organizationId: input.organizationId,
        userId: user?.id,
        status: 'pending',
      });

      if (existingRequest) {
        throw createError.validation(
          'You already have a pending join request',
          {
            field: 'organizationId',
          }
        );
      }

      const request = await OrganizationJoinRequest.create({
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
        entityType: 'OrganizationJoinRequest',
        error,
      });
    }
  },
};
