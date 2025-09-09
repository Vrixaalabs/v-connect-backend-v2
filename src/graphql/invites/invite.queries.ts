import { config } from '@/config/app.config';
import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { BaseError } from '../../types/errors/base.error';
import { GraphQLContext } from '../context';
import { MyEntityInvitesResponse } from './invite.interfaces';

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
        { $lookup: { from: 'entities', localField: 'entityId', foreignField: 'entityId', as: 'entity' } },
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
};
