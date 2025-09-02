import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { User } from '../../models/User';
import { AMASession } from '../../models/AMASession';
import { Event } from '../../models/Events'; // <-- import Event model
import { BaseError } from '../../types/errors/base.error';

export const alumniQueries = {
  // Current logged-in user
  me: async (
    _: unknown,
    __: unknown,
    { isAuthenticated, userId }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated || !userId) {
        throw createError.authentication('Not authenticated');
      }

      const user = await User.findOne({ userId });
      if (!user) {
        throw createError.notFound(`User with ID ${userId} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch current user', {
        operation: 'me',
        userId,
        error,
      });
    }
  },

  // Get user by ID
  user: async (
    _: unknown,
    { id }: { id: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const user = await User.findById(id);
      if (!user) {
        throw createError.notFound(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch user', {
        operation: 'user',
        id,
        error,
      });
    }
  },

  // Get all users (with optional filters)
  users: async (
    _: unknown,
    {
      graduationYear,
      department,
    }: { graduationYear?: number; department?: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const query: Record<string, unknown> = {};
      if (graduationYear) query['graduationYear'] = graduationYear;
      if (department) query['department'] = department;

      const users = await User.find(query);
      return users;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch users', {
        operation: 'users',
        graduationYear,
        department,
        error,
      });
    }
  },

  // Get all AMA sessions (optionally filter by active)
  amaSessions: async (
    _: unknown,
    { active }: { active?: boolean },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const filter: Record<string, unknown> = {};
      if (active !== undefined) {
        filter.active = active;
      }

      const sessions = await AMASession.find(filter).sort({ scheduledAt: -1 });
      return sessions;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch AMA sessions', {
        operation: 'amaSessions',
        active,
        error,
      });
    }
  },

  // Get a single AMA session
  amaSession: async (
    _: unknown,
    { id }: { id: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const session = await AMASession.findById(id);
      if (!session) {
        throw createError.notFound(`AMA session with ID ${id} not found`);
      }

      return session;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch AMA session', {
        operation: 'amaSession',
        id,
        error,
      });
    }
  },

  // === Event Queries ===

  // Get all events
  events: async (
    _: unknown,
    __: unknown,
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const events = await Event.find().sort({ startDate: 1 }); // upcoming first
      return events;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch events', {
        operation: 'events',
        error,
      });
    }
  },

  // Get a single event
  event: async (
    _: unknown,
    { id }: { id: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const event = await Event.findById(id);
      if (!event) {
        throw createError.notFound(`Event with ID ${id} not found`);
      }

      return event;
    } catch (error) {
      if (error instanceof BaseError) throw error;
      throw createError.database('Failed to fetch event', {
        operation: 'event',
        id,
        error,
      });
    }
  },
};
