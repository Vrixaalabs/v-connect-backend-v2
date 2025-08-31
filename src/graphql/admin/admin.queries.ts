import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { InstituteJoinRequest } from '../../models/InstituteJoinRequest';
import { BaseError } from '../../types/errors/base.error';

export const adminQueries = {
  getJoinRequests: async (
    _: unknown,
    { instituteId, status, page = 1, limit = 10 }: { instituteId: string; status?: string; page: number; limit: number },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const query: any = { instituteId };
      if (status) {
        query.status = status;
      }

      const total = await InstituteJoinRequest.countDocuments(query);
      const requests = await InstituteJoinRequest.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Join requests fetched successfully',
        requests,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch join requests', {
        operation: 'getJoinRequests',
        entityType: 'InstituteJoinRequest',
        instituteId,
        error,
      });
    }
  },

  getJoinRequest: async (
    _: unknown,
    { requestId }: { requestId: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const request = await InstituteJoinRequest.findOne({ requestId });
      if (!request) {
        throw createError.notFound(`Join request with ID ${requestId} not found`, {
          entityType: 'InstituteJoinRequest',
          entityId: requestId,
        });
      }

      return {
        success: true,
        message: 'Join request fetched successfully',
        request,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch join request', {
        operation: 'getJoinRequest',
        entityType: 'InstituteJoinRequest',
        requestId,
        error,
      });
    }
  },
};
