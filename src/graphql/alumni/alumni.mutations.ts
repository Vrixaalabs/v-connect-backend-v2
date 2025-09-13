import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { AMASession } from '../../models/AMASession';
import { JobInternship } from '../../models/JobInternship';
import { BaseError } from '../../types/errors/base.error';

export const alumniMutations = {
  // === AMA Mutations ===

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
        operation: 'endAMASession',
        id,
        error,
      });
    }
  },

  // === Job/Internship Mutations ===

  // Create a new Job or Internship
  createJobInternship: async (
    _: unknown,
    {
      title,
      description,
      organization,
      role,
      link,
    }: { title: string; description?: string; organization: string; role: string; link: string },
    { isAuthenticated, userId }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !userId) {
        throw createError.authentication('Not authenticated');
      }

      const job = new JobInternship({
        title,
        description,
        organization,
        role,
        link,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await job.save();
      return job;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to create job/internship', {
        operation: 'createJobInternship',
        error,
      });
    }
  },

  // End (deactivate) a Job or Internship
  endJobInternship: async (
    _: unknown,
    { _id }: { _id: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const job = await JobInternship.findById(_id);
      if (!job) {
        throw createError.notFound(`Job/Internship with ID ${_id} not found`);
      }

      job.active = false;
      job.updatedAt = new Date();
      await job.save();

      return job;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to end job/internship', {
        operation: 'endJobInternship',
        _id,
        error,
      });
    }
  },
};
