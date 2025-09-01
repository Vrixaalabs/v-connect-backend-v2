import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { InstituteJoinRequest } from '../../models/InstituteJoinRequest';
import { InstituteRole } from '../../models/InstituteRole';
import { InstituteUserRole } from '../../models/InstituteUserRole';
import { BaseError } from '../../types/errors/base.error';

export const adminMutations = {
  approveJoinRequest: async (
    _: unknown,
    { requestId }: { requestId: string },
    { isAuthenticated, user }: GraphQLContext
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
            approvedBy: user?.id,
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
        userId: request.userId as string,
        roleId: studentRole.roleId,
        departmentId: request.departmentId,
        assignedBy: user?.id,
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
    { isAuthenticated }: GraphQLContext
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
