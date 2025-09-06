import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { OrganizationJoinRequest } from '../../models/OrganizationJoinRequest';
import { BaseError } from '../../types/errors/base.error';

export const adminQueries = {
  getJoinRequests: async (
    _: unknown,
    { organizationId, status, page = 1, limit = 10 }: { organizationId: string; status?: string; page: number; limit: number },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const query: any = { organizationId };
      if (status) {
        query.status = status;
      }

      const total = await OrganizationJoinRequest.countDocuments(query);
      const requests = await OrganizationJoinRequest.find(query)
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
        entityType: 'OrganizationJoinRequest',
        organizationId,
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

      const request = await OrganizationJoinRequest.findOne({ requestId });
      if (!request) {
        throw createError.notFound(`Join request with ID ${requestId} not found`, {
          entityType: 'OrganizationJoinRequest',
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
        entityType: 'OrganizationJoinRequest',
        requestId,
        error,
      });
    }
  },
};
