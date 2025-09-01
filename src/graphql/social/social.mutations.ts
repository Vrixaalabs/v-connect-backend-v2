import { socialService } from './social.services';
import { GraphQLContext } from '../context';

export const socialMutations = {
  updateFriendProfile: async (
    _: unknown,
    { input }: { input: Record<string, unknown> },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.updateProfile(ctx.user!.id, input);
  },
  updateFriendPortfolio: async (
    _: unknown,
    { input }: { input: { entries: Array<any> } },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.replacePortfolio(ctx.user!.id, input.entries);
  },
  sendFriendRequest: async (
    _: unknown,
    { targetUserId }: { targetUserId: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.sendFriendRequest(ctx.user!.id, targetUserId);
  },
  acceptFriendRequest: async (
    _: unknown,
    { requesterUserId }: { requesterUserId: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.acceptFriendRequest(ctx.user!.id, requesterUserId);
  },
  rejectFriendRequest: async (
    _: unknown,
    { requesterUserId }: { requesterUserId: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.rejectFriendRequest(ctx.user!.id, requesterUserId);
  },
  removeFriend: async (
    _: unknown,
    { friendUserId }: { friendUserId: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.removeFriend(ctx.user!.id, friendUserId);
  },
  createRequest: async (
    _: unknown,
    { title, description, category }: { title: string; description: string; category: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.createRequest(ctx.user!.id, title, description, category);
  },
  respondToRequest: async (
    _: unknown,
    { requestId }: { requestId: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.respondToRequest(ctx.user!.id, requestId);
  },
  withdrawResponse: async (
    _: unknown,
    { requestId }: { requestId: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.isAuthenticated) throw new Error('Not authenticated');
    return socialService.withdrawResponse(ctx.user!.id, requestId);
  },
};
