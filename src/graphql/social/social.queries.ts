import { socialService } from './social.services';
import { GraphQLContext } from '../context';

export const socialQueries = {
  getFriendProfile: async (_: unknown, { userId }: { userId: string }) => {
    return socialService.getOrCreateProfile(userId);
  },
  getRandomUsers: async (_: unknown, { limit = 10 }: { limit: number }) => {
    const users = await socialService.randomUsers(limit);
    return { users };
  },
  getSuggestedUsers: async (
    _: unknown,
    { limit = 10 }: { limit: number },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    const users = await socialService.suggestedUsers(ctx.user!.id, limit);
    return { users };
  },
  getFriends: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    const connections = await socialService.getFriends(ctx.user!.id);
    return { connections };
  },
  getRequests: async (
    _: unknown,
    { category, limit = 10, offset = 0 }: { category?: string; limit: number; offset: number }
  ) => {
    const { requests, total } = await socialService.listRequests(
      category,
      limit,
      offset
    );
    return { requests, total };
  },
  getRequest: async (_: unknown, { id }: { id: string }) => {
    return socialService.getRequest(id);
  },
  getRequestResponders: async (_: unknown, { requestId }: { requestId: string }) => {
    const responders = await socialService.getRequestResponders(requestId);
    return { responders };
  },
};
