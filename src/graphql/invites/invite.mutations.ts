import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import { BaseError } from '../../types/errors/base.error';
import { GraphQLContext } from '../context';
import { 
  InviteEntityMemberResponse,
  InviteEntityMemberArgs,
} from './invite.interfaces';
import { User } from '@/models/User';

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
};
