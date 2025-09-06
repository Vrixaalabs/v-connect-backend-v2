import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Institute } from '../../models/Institute';
import { OrganizationRole } from '../../models/OrganizationRole';
import { OrganizationJoinRequest } from '../../models/OrganizationJoinRequest';
import { OrganizationUserRole } from '../../models/OrganizationUserRole';
import { 
  OrganizationFilterInput,
  SearchOrganizationsArgs,
  GetOrganizationBySlugArgs,
  GetOrganizationByIdArgs,
  GetOrganizationRolesArgs,
  GetOrganizationRoleArgs,
  OrganizationsResponse,
  OrganizationResponse,
  OrganizationRolesResponse,
  OrganizationRoleResponse,
} from './organization.interfaces';
import { BaseError } from '../../types/errors/base.error';
import { Organization } from '@/models/Organization';

export const organizationQueries = {
  searchOrganizations: async (
    _: unknown,
    { filter, page = 1, limit = 10 }: SearchOrganizationsArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationsResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const query: any = {};
      if (filter) {
        if (filter.name) {
          query.name = { $regex: filter.name, $options: 'i' };
        }
        if (filter.city) {
          query['address.city'] = { $regex: filter.city, $options: 'i' };
        }
        if (filter.state) {
          query['address.state'] = { $regex: filter.state, $options: 'i' };
        }
        if (filter.isVerified !== undefined) {
          query.isVerified = filter.isVerified;
        }
        if (filter.isActive !== undefined) {
          query.isActive = filter.isActive;
        }
      }

      const total = await Organization.countDocuments(query);
      const organizations = await Organization.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Organizations fetched successfully',
        organizations,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organizations', {
        operation: 'search',
        entityType: 'Organization',
        error,
      });
    }
  },

  getOrganizationBySlug: async (
    _: unknown,
    { slug }: GetOrganizationBySlugArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const organization = await Organization.findOne({ slug });
      if (!organization) {
        throw createError.notFound(`Organization with slug ${slug} not found`, {
          entityType: 'Organization',
          slug,
        });
      }

      return {
        success: true,
        message: 'Organization fetched successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organization', {
        operation: 'getBySlug',
        entityType: 'Organization',
        slug,
        error,
      });
    }
  },

  getOrganizationById: async (
    _: unknown,
    { organizationId }: GetOrganizationByIdArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const organization = await Organization.findOne({ organizationId });
      if (!organization) {
        throw createError.notFound(`Organization with ID ${organizationId} not found`, {
          entityType: 'Organization',
          entityId: organizationId,
        });
      }

      return {
        success: true,
        message: 'Organization fetched successfully',
        organization,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organization', {
        operation: 'getById',
        entityType: 'Organization',
        entityId: organizationId,
        error,
      });
    }
  },

  getOrganizationRoles: async (
    _: unknown,
    { organizationId }: GetOrganizationRolesArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<OrganizationRolesResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const roles = await OrganizationRole.find({ organizationId });

      return {
        success: true,
        message: 'Organization roles fetched successfully',
        roles,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organization roles', {
        operation: 'getRoles',
        entityType: 'OrganizationRole',
        organizationId,
        error,
      });
    }
  },

  getOrganizationRole: async (
    _: unknown,
    { roleId }: GetOrganizationRoleArgs,
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

      return {
        success: true,
        message: 'Organization role fetched successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organization role', {
        operation: 'getRole',
        entityType: 'OrganizationRole',
        roleId,
        error,
      });
    }
  },
};
