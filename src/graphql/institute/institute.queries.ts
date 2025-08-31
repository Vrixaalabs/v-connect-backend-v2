import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Institute } from '../../models/Institute';
import { InstituteRole } from '../../models/InstituteRole';
import { InstituteJoinRequest } from '../../models/InstituteJoinRequest';
import { InstituteUserRole } from '../../models/InstituteUserRole';
import { InstituteFilterInput } from './institute.interfaces';
import { BaseError } from '../../types/errors/base.error';

export const instituteQueries = {
  searchInstitutes: async (
    _: unknown,
    { filter, page = 1, limit = 10 }: { filter?: InstituteFilterInput; page: number; limit: number },
    { isAuthenticated }: GraphQLContext
  ) => {
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

      const total = await Institute.countDocuments(query);
      const institutes = await Institute.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Institutes fetched successfully',
        institutes,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch institutes', {
        operation: 'search',
        entityType: 'Institute',
        error,
      });
    }
  },

  getInstituteBySlug: async (
    _: unknown,
    { slug }: { slug: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const institute = await Institute.findOne({ slug });
      if (!institute) {
        throw createError.notFound(`Institute with slug ${slug} not found`, {
          entityType: 'Institute',
          slug,
        });
      }

      return {
        success: true,
        message: 'Institute fetched successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch institute', {
        operation: 'getBySlug',
        entityType: 'Institute',
        slug,
        error,
      });
    }
  },

  getInstituteById: async (
    _: unknown,
    { instituteId }: { instituteId: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const institute = await Institute.findOne({ instituteId });
      if (!institute) {
        throw createError.notFound(`Institute with ID ${instituteId} not found`, {
          entityType: 'Institute',
          entityId: instituteId,
        });
      }

      return {
        success: true,
        message: 'Institute fetched successfully',
        institute,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch institute', {
        operation: 'getById',
        entityType: 'Institute',
        entityId: instituteId,
        error,
      });
    }
  },

  getInstituteRoles: async (
    _: unknown,
    { instituteId }: { instituteId: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const roles = await InstituteRole.find({ instituteId });

      return {
        success: true,
        message: 'Institute roles fetched successfully',
        roles,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch institute roles', {
        operation: 'getRoles',
        entityType: 'InstituteRole',
        instituteId,
        error,
      });
    }
  },

  getInstituteRole: async (
    _: unknown,
    { roleId }: { roleId: string },
    { isAuthenticated }: GraphQLContext
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

      return {
        success: true,
        message: 'Institute role fetched successfully',
        role,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch institute role', {
        operation: 'getRole',
        entityType: 'InstituteRole',
        roleId,
        error,
      });
    }
  },
};
