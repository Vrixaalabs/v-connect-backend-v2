import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import { BaseError } from '../../types/errors/base.error';
import { GraphQLContext } from '../context';
import {
import {
  InviteEntityMemberResponse,
  InviteEntityMemberArgs,
  AcceptEntityInviteArgs,
  AcceptEntityInviteResponse,
} from './invite.interfaces';
import { User } from '@/models/User';
import { EntityMember } from '@/models/EntityMember';
import { Entity } from '@/models/Entity';
import { MemberStatus } from '../entity/entity.interfaces';

export const inviteMutations = {
  inviteEntityMember: async (
    _: unknown,
    { input }: InviteEntityMemberArgs,
    context: GraphQLContext
  ): Promise<InviteEntityMemberResponse> => {
    if (!context.isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      // check if user exists
      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw createError.notFound('User not found', {
          entityType: 'User',
          email: input.email,
        });
      }

      const invite = await InviteModel.create({
        userId: user.userId,
        entityId: input.entityId,
        email: input.email,
        rollNumber: input.rollNumber,
        batch: input.batch,
        role: input.role,
        status: 'pending',
      });

      // await sendInviteEmail(invite);

      return {
        success: true,
        message: 'Invite sent',
        invite,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to invite entity member', {
        operation: 'inviteEntityMember',
        entityType: 'Invite',
        error,
      });
    }
  },
  acceptEntityInvite: async (
    _: unknown,
    { input }: AcceptEntityInviteArgs,
    context: GraphQLContext
  ): Promise<AcceptEntityInviteResponse> => {
    if (!context.isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const invite = await InviteModel.findOne({ inviteId: input.inviteId });
      if (!invite) {
        throw createError.notFound('Invite not found', {
          entityType: 'Invite',
          inviteId: input.inviteId,
        });
      }

      invite.status = 'accepted';
      await invite.save();

      // add user to entitymembers
      await EntityMember.create({
        userId: invite.userId,
        entityId: invite.entityId,
        roleId: '7e194669-d391-4e58-8279-3695285fdd04',
        status: MemberStatus.ACTIVE,
      });

      // update entity metadata
      const entity = await Entity.findOne({ entityId: invite.entityId });
      if (!entity) {
        throw createError.notFound('Entity not found', {
          entityType: 'Entity',
          entityId: invite.entityId,
        });
      }

      // entity.metadata!.totalMembers++;
      if (entity.metadata) {
        entity.metadata.totalMembers = entity?.metadata?.totalMembers || 0 + 1;
      } else {
        entity.metadata = {
          totalMembers: 1,
          totalPosts: 0,
          totalEvents: 0,
          lastActivityAt: new Date(),
        };
      }
      await entity.save();

      return {
        success: true,
        message: 'Invite accepted successfully',
        invite,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to accept entity invite', {
        operation: 'acceptEntityInvite',
        entityType: 'Invite',
        error,
      });
    }
  },
};
