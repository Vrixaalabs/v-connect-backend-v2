import { getRedisClient } from '@/config/redis';
import { createError } from '@/middleware/errorHandler';
import { BaseError } from '../../types/errors/base.error';

interface MessageData {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: string;
  user: unknown;
}

interface CreateMessageArgs {
  content: string;
  roomId: string;
}

interface CreateRoomArgs {
  name: string;
}

interface Context {
  user: unknown;
  isAuthenticated: boolean;
}

export const messageMutations = {
  createMessage: async (
    _: unknown,
    { content, roomId }: CreateMessageArgs,
    { user, isAuthenticated }: Context
  ): Promise<MessageData> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const redis = getRedisClient();
      const messageData: MessageData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        userId: (user as { id: string }).id,
        roomId,
        createdAt: new Date().toISOString(),
        user,
      };

      await redis.lpush(`chat:${roomId}:messages`, JSON.stringify(messageData));
      await redis.ltrim(`chat:${roomId}:messages`, 0, 99);

      return messageData;
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create message', {
        operation: 'create',
        entityType: 'Message',
      });
    }
  },
  createRoom: async (
    _: unknown,
    { name }: CreateRoomArgs,
    { isAuthenticated }: { isAuthenticated: boolean }
  ): Promise<{
    id: string;
    name: string;
    messages: unknown[];
    participants: unknown[];
    createdAt: string;
  }> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }
    try {
      return {
        id: 'room-1',
        name,
        messages: [],
        participants: [],
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create room', {
        operation: 'create',
        entityType: 'Room',
      });
    }
  },
};
