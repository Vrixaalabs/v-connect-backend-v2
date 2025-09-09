import {
  FriendConnection,
  IFriendConnection,
} from '../../models/FriendConnection';
import { FriendProfile, IFriendProfile } from '../../models/FriendProfile';
import { GraphQLContext } from '../context';

export const networkQueries = {
  getFriendConnections: async (
    _: unknown,
    {
      page = 1,
      limit = 10,
      status,
    }: { page: number; limit: number; status?: string },
    { isAuthenticated, user }: GraphQLContext
  ) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const query = {
        $or: [{ userId: user?.id }, { friendId: user?.id }],
      };

      if (status) {
        (query as { status?: string })['status'] = status.toLowerCase() as
          | 'pending'
          | 'accepted'
          | 'rejected'
          | 'blocked';
      }

      const total = await FriendConnection.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const connections = await FriendConnection.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName avatar')
        .populate('friendId', 'firstName lastName avatar');

      return {
        success: true,
        message: 'Friend connections retrieved successfully',
        connections,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        connections: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  getFriendProfile: async (
    _: unknown,
    { userId }: { userId: string },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const profile = await FriendProfile.findOne({ userId }).populate(
        'userId',
        'firstName lastName avatar email'
      );

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Check visibility permissions
      if (
        profile.visibility === 'private' &&
        profile.userId !== context.user?.id
      ) {
        const isConnected = await FriendConnection.exists({
          $or: [
            { userId: context.user?.id, friendId: userId },
            { userId: userId, friendId: context.user?.id },
          ],
          status: 'accepted',
        });

        if (!isConnected) {
          throw new Error('Profile is private');
        }
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        profile,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        profile: null,
      };
    }
  },

  getFriendSuggestions: async (
    _: unknown,
    { limit = 10 }: { limit: number },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      // Get current user's connections
      const currentConnections = await FriendConnection.find({
        $or: [{ userId: context.user?.id }, { friendId: context.user?.id }],
      }).select('userId friendId');

      // Get connected user IDs
      const connectedUserIds = new Set(
        currentConnections.flatMap((conn: IFriendConnection) => [
          conn.userId,
          conn.friendId,
        ])
      );

      // Get current user's profile
      const userProfile = await FriendProfile.findOne({
        userId: context.user?.id,
      });

      // Find profiles with similar interests or education
      const suggestions = await FriendProfile.find({
        userId: { $ne: context.user?.id, $nin: Array.from(connectedUserIds) },
        visibility: 'public',
        $or: [
          { interests: { $in: userProfile?.interests || [] } },
          {
            'education.institute': {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              $in: userProfile?.education?.map((e: any) => e.institute) || [],
            },
          },
        ],
      })
        .limit(limit)
        .populate('userId', 'firstName lastName avatar');

      return {
        success: true,
        message: 'Friend suggestions retrieved successfully',
        suggestions,
        total: suggestions.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [],
        total: 0,
      };
    }
  },

  getNetworkStats: async (_: unknown, __: unknown, context: GraphQLContext) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const [totalConnections, pendingRequests] = await Promise.all([
        FriendConnection.countDocuments({
          $or: [{ userId: context.user?.id }, { friendId: context.user?.id }],
          status: 'accepted',
        }),
        FriendConnection.countDocuments({
          friendId: context.user?.id,
          status: 'pending',
        }),
      ]);

      const userProfile = await FriendProfile.findOne({
        userId: context.user?.id,
      });
      const connectedProfiles = await FriendProfile.find({
        userId: {
          $in: (
            await FriendConnection.find({
              $or: [
                { userId: context.user?.id },
                { friendId: context.user?.id },
              ],
              status: 'accepted',
            })
          ).map((conn: IFriendConnection) =>
            conn.userId === context.user?.id ? conn.friendId : conn.userId
          ),
        },
      });

      const commonInterests = new Set(
        connectedProfiles.flatMap(
          (profile: IFriendProfile) =>
            profile.interests?.filter((interest: string) =>
              userProfile?.interests?.includes(interest)
            ) || []
        )
      ).size;

      return {
        success: true,
        message: 'Network stats retrieved successfully',
        stats: {
          totalConnections,
          pendingRequests,
          mutualFriends: 0, // This would require additional computation
          commonInterests,
          commonGroups: 0, // This would require integration with groups/entities
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          totalConnections: 0,
          pendingRequests: 0,
          mutualFriends: 0,
          commonInterests: 0,
          commonGroups: 0,
        },
      };
    }
  },
};
