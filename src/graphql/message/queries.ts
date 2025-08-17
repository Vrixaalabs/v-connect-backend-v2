import { getRedisClient } from '@/config/redis';
import { createError } from '@/middleware/errorHandler';
import { BaseError } from '../../types/errors/base.error';

interface MessagesArgs {
  roomId: string;
}

interface Context {
  isAuthenticated: boolean;
}

export const messageQueries = {
  messages: async (
    _: unknown,
    { roomId }: MessagesArgs,
    { isAuthenticated }: Context
  ): Promise<unknown[]> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const redis = getRedisClient();
      const messages = await redis.lrange(`chat:${roomId}:messages`, 0, -1);
      return messages.map((msg: string) => JSON.parse(msg));
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get messages', {
        operation: 'get',
        entityType: 'Message',
      });
    }
  },
  rooms: async (
    _: unknown,
    __: unknown,
    { isAuthenticated }: Context
  ): Promise<unknown[]> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const redis = getRedisClient();
      const rooms = await redis.smembers('rooms');
      return rooms.map((room: string) => JSON.parse(room));
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get rooms', {
        operation: 'get',
        entityType: 'Room',
      });
    }
  },
};
