import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import { BaseError } from '../../types/errors/base.error';
import { GraphQLContext } from '../context';
import {
  MyEntityInvitesResponse,
  GetInviteByEntityIdResponse,
} from './invite.interfaces';

export const inviteQueries = {
  getMyEntityInvites: async (
    _: unknown,
    __: unknown,
    context: GraphQLContext
  ): Promise<MyEntityInvitesResponse> => {
    if (!context.isAuthenticated || !context.user) {
      throw createError.authentication('Not authenticated');
    }

    try {
      //   aggregate
      const invites = await InviteModel.aggregate([
        { $match: { userId: context.user?.id } },
        {
          $lookup: {
            from: 'entities',
            localField: 'entityId',
            foreignField: 'entityId',
            as: 'entity',
          },
        },
        { $unwind: '$entity' },
      ]);

      console.log(invites);

      return {
        success: true,
        message: 'My entity invites retrieved successfully',
        invites,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get my entity invites', {
        operation: 'getMyEntityInvites',
        entityType: 'Invite',
        error,
      });
    }
  },
  getInviteByEntityId: async (
    _: unknown,
    { entityId }: { entityId: string },
    context: GraphQLContext
  ): Promise<GetInviteByEntityIdResponse> => {
    if (!context.isAuthenticated || !context.user) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const invites = await InviteModel.aggregate([
        { $match: { entityId: entityId } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ]);

      console.log(invites);

      return {
        success: true,
        message: 'Invites retrieved successfully',
        invites,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get invite by entityId', {
        operation: 'getInviteByEntityId',
        entityType: 'Invite',
        error,
      });
    }
  },
};
