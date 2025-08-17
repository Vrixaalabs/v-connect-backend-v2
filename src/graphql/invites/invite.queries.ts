import { config } from '@/config/app.config';
import {
  Context,
  GetAllInviteResult,
  GetInviteByIdArgs,
  GetInviteByIdResult,
  GetMockInviteTokenArgs,
  GetMockInviteTokenResult,
} from '@/graphql/invites/invite.types';
import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { BaseError } from '../../types/errors/base.error';

export const inviteQueries = {
  getAllInvite: async (
    _: unknown,
    __: unknown,
    { isAuthenticated }: Context
  ): Promise<GetAllInviteResult> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }
      const invites = await InviteModel.find();

      return {
        success: true,
        invites,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch all invites', {
        operation: 'get',
        entityType: 'Invite',
      });
    }
  },
  getInviteById: async (
    _: unknown,
    args: GetInviteByIdArgs
  ): Promise<GetInviteByIdResult> => {
    try {
      if (!mongoose.isValidObjectId(args.id))
        return { success: true, invite: null };

      const invite = await InviteModel.findById(args.id);

      return {
        success: true,
        invite: invite || null,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch the invite', {
        operation: 'get',
        entityType: 'Invite',
      });
    }
  },
  getMockInviteToken: async (
    _: unknown,
    args: GetMockInviteTokenArgs
  ): Promise<GetMockInviteTokenResult> => {
    try {
      const options = { expiresIn: '30m' } as SignOptions;
      const newToken = jwt.sign(
        { userId: args.userId },
        config.jwt.accessSecret as jwt.Secret,
        options
      );

      return {
        success: true,
        newToken,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch the invite', {
        operation: 'get',
        entityType: 'Invite',
      });
    }
  },
};
