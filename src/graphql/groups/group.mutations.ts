import { createError } from '@/middleware/errorHandler';
import { GraphQLContext } from '../context';
import { EntityChat } from '@/models/EntityChat';
import {
  CreateEntityChatArgs,
  CommonEntityChatResponse,
  IEntityChat,
  AddMessageToEntityChatArgs,
} from './group.interfaces';
import { BaseError } from '@/types/errors/base.error';

export const groupMutations = {
  createEntityChat: async (
    _: unknown,
    { input }: CreateEntityChatArgs,
    context: GraphQLContext
  ): Promise<CommonEntityChatResponse> => {
    if (!context.isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const entityChat = await EntityChat.create({
        ...input,
        userId: context.user?.id,
      });

      return {
        success: true,
        message: 'Entity chat created successfully',
        entityChat: entityChat,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create entity chat', {
        operation: 'create',
        entityType: 'EntityChat',
        error,
      });
    }
  },
  addMessageToEntityChat: async (
    _: unknown,
    { input }: AddMessageToEntityChatArgs,
    context: GraphQLContext
  ): Promise<CommonEntityChatResponse> => {
    if (!context.isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const entityChat = await EntityChat.findOneAndUpdate(
        { entityChatId: input.entityChatId },
        {
          $push: {
            messages: { userId: context.user?.id, message: input.message },
          },
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Message added to entity chat successfully',
        entityChat: entityChat as IEntityChat,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to add message to entity chat', {
        operation: 'add',
        entityType: 'EntityChat',
        error,
      });
    }
  },
};
