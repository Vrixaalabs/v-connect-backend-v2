import { createError } from '@/middleware/errorHandler';
import {
  CommonEntityChatResponse,
  GetEntityChatArgs,
  IEntityChat,
} from './group.interfaces';
import { EntityChat } from '@/models/EntityChat';
import { GraphQLContext } from '../context';
import { BaseError } from '@/types/errors/base.error';

export const groupQueries = {
  getEntityChat: async (
    _: unknown,
    { input }: GetEntityChatArgs,
    context: GraphQLContext
  ): Promise<CommonEntityChatResponse> => {
    if (!context.isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const entityChat = await EntityChat.findOne({
        entityChatId: input.entityChatId,
      });
      if (!entityChat) {
        throw createError.notFound('Entity chat not found', {
          entityType: 'EntityChat',
          entityChatId: input.entityChatId,
        });
      }

      return {
        success: true,
        message: 'Entity chat fetched successfully',
        entityChat: entityChat as IEntityChat,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entity chat', {
        operation: 'getEntityChat',
        entityType: 'EntityChat',
        error,
      });
    }
  },
};
