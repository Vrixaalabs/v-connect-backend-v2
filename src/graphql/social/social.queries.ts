import { socialService } from './social.services';
import { GraphQLContext } from '../context';

export const socialQueries = {
  getFriendProfile: async (
    _: unknown,
    { userId }: { userId: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.getOrCreateProfile(userId);
  },
  getRandomUsers: async (
    _: unknown,
    { limit = 10 }: { limit: number },
    { isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const users = await socialService.randomUsers(limit);
    return { users };
  },
  getSuggestedUsers: async (
    _: unknown,
    { limit = 10 }: { limit: number },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const users = await socialService.suggestedUsers(user!.id, limit);
    return { users };
  },
  getFriends: async (
    _: unknown,
    __: unknown,
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const connections = await socialService.getFriends(user!.id);
    return { connections };
  },
  getRequests: async (
    _: unknown,
    { category, limit = 10, offset = 0 }: { category?: string; limit: number; offset: number },
    { isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const { requests, total } = await socialService.listRequests(
      category,
      limit,
      offset
    );
    return { requests, total };
  },
  getRequest: async (_: unknown, { id }: { id: string }, { isAuthenticated }: GraphQLContext) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.getRequest(id);
  },
  getRequestResponders: async (
    _: unknown,
    { requestId }: { requestId: string },
    { isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const responders = await socialService.getRequestResponders(requestId);
    return { responders };
  },
};
