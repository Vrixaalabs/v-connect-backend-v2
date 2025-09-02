import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { AMASession } from '../../models/AMASession';
import { Event } from '../../models/Events'; // <-- import Event model
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

  // === Event Mutations ===

  // Create a new Event
  createEvent: async (
    _: unknown,
    { input }: { input: any },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const event = new Event({
        ...input,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      });

      await event.save();
      return event;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to create event', {
        operation: 'createEvent',
        input,
        error,
      });
    }
  },

  // Update an existing Event
  updateEvent: async (
    _: unknown,
    { id, input }: { id: string; input: any },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const updates: any = { ...input };
      if (input.startDate) updates.startDate = new Date(input.startDate);
      if (input.endDate) updates.endDate = new Date(input.endDate);

      const event = await Event.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!event) {
        throw createError.notFound(`Event with ID ${id} not found`);
      }

      return event;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to update event', {
        operation: 'updateEvent',
        id,
        input,
        error,
      });
    }
  },

  // Delete an Event
  deleteEvent: async (
    _: unknown,
    { id }: { id: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const event = await Event.findByIdAndDelete(id);
      if (!event) {
        throw createError.notFound(`Event with ID ${id} not found`);
      }

      return true;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to delete event', {
        operation: 'deleteEvent',
        id,
        error,
      });
    }
  },
};
