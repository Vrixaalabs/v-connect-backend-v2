import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { AMASession } from '../../models/AMASession';
import { BaseError } from '../../types/errors/base.error';

export const alumniMutations = {
  // Create a new AMA session
  createAMASession: async (
    _: unknown,
    {
      title,
      description,
      scheduledAt,
    }: { title: string; description?: string; scheduledAt: string },
    { isAuthenticated, userId }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !userId) {
        throw createError.authentication('Not authenticated');
      }

      const session = new AMASession({
        title,
        description,
        host: userId,
        scheduledAt: new Date(scheduledAt),
        active: true,
      });

      await session.save();
      return session;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to create AMA session', {
        operation: 'createAMASession',
        error,
      });
    }
  },

  // Close an AMA session
  endAMASession: async (
    _: unknown,
    { id }: { id: string },
    { isAuthenticated, userId }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !userId) {
        throw createError.authentication('Not authenticated');
      }

      const session = await AMASession.findById(id);
      if (!session) {
        throw createError.notFound(`AMA session with ID ${id} not found`);
      }

      // Optional: only the host can close
      if (session.host.toString() !== userId.toString()) {
        throw createError.forbidden('You are not the host of this session');
      }

      session.active = false;
      await session.save();
      return session;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to close AMA session', {
        operation: 'closeAMASession',
        id,
        error,
      });
    }
  },

};
