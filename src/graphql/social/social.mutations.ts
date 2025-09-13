import { socialService } from './social.services';
import { GraphQLContext } from '../context';

export const socialMutations = {
  updateFriendProfile: async (
    _: unknown,
    { input }: { input: Record<string, unknown> },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.updateProfile(user?.id as string, input);
  },
  updateFriendPortfolio: async (
    _: unknown,
    { input }: { input: { entries: Array<unknown> } },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.replacePortfolio(user?.id as string, input.entries);
  },
  sendFriendRequest: async (
    _: unknown,
    { targetUserId }: { targetUserId: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.sendFriendRequest(user?.id as string, targetUserId);
  },
  acceptFriendRequest: async (
    _: unknown,
    { requesterUserId }: { requesterUserId: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.acceptFriendRequest(
      user?.id as string,
      requesterUserId
    );
  },
  rejectFriendRequest: async (
    _: unknown,
    { requesterUserId }: { requesterUserId: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.rejectFriendRequest(
      user?.id as string,
      requesterUserId
    );
  },
  removeFriend: async (
    _: unknown,
    { friendUserId }: { friendUserId: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.removeFriend(user?.id as string, friendUserId);
  },
  createRequest: async (
    _: unknown,
    {
      title,
      description,
      category,
    }: { title: string; description: string; category: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.createRequest(
      user?.id as string,
      title,
      description,
      category
    );
  },
  respondToRequest: async (
    _: unknown,
    { requestId }: { requestId: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.respondToRequest(user?.id as string, requestId);
  },
  withdrawResponse: async (
    _: unknown,
    { requestId }: { requestId: string },
    { user, isAuthenticated }: GraphQLContext
  ) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return socialService.withdrawResponse(user?.id as string, requestId);
  },
};
