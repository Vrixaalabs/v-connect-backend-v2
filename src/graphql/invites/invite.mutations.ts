import InviteService from '@/graphql/invites/invite.services';
import {
  AcceptInviteArgs,
  AcceptInviteResult,
  Context,
  InviteUserArgs,
  InviteUserResult,
  SeedInviteResult,
} from '@/graphql/invites/invite.types';
import { createError } from '@/middleware/errorHandler';
import { dummyInvites } from '@/mock/invite.mock';
import { InviteModel } from '@/models/invite.model';
import { BaseError } from '../../types/errors/base.error';

export const inviteMutations = {
  inviteUser: async (
    _: unknown,
    args: InviteUserArgs,
    { isAuthenticated }: Context
  ): Promise<InviteUserResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }
    try {
      const { invite, inviteUrl } = await InviteService.sendInvite(
        args.email,
        args.orgId,
        args.roleId
      );
      return {
        success: true,
        message: 'Invite sent',
        invite,
        inviteUrl,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to send invite', {
        operation: 'send',
        entityType: 'Invite',
      });
    }
  },
  acceptInvite: async (
    _: unknown,
    args: AcceptInviteArgs
  ): Promise<AcceptInviteResult> => {
    try {
      const { newUser, invite, inviteToken, redirectUri, message, success } =
        await InviteService.handleInvite(args.token);

      return {
        success: Boolean(success),
        message,
        redirectUri,
        newUser,
        invite,
        inviteToken,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to accept invite', {
        operation: 'accept',
        entityType: 'Invite',
      });
    }
  },
  seedInvite: async (): Promise<SeedInviteResult> => {
    try {
      await InviteModel.insertMany(dummyInvites);
      return {
        success: true,
        message: 'Dummy invites inserted successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to save invites', {
        operation: 'save',
        entityType: 'Invite',
      });
    }
  },
};
