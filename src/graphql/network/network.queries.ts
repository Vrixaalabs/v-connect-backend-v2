import { FriendConnection, FriendProfile } from '@/models';
import { Context } from '../context';

export const networkQueries = {
  getFriendConnections: async (_: any, { page = 1, limit = 10, status }: { page: number; limit: number; status?: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const query = {
        $or: [
          { userId: context.userId },
          { friendId: context.userId }
        ]
      };

      if (status) {
        query['status'] = status.toLowerCase();
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
        message: error.message,
        connections: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  getFriendProfile: async (_: any, { userId }: { userId: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const profile = await FriendProfile.findOne({ userId })
        .populate('userId', 'firstName lastName avatar email');

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Check visibility permissions
      if (profile.visibility === 'private' && profile.userId !== context.userId) {
        const isConnected = await FriendConnection.exists({
          $or: [
            { userId: context.userId, friendId: userId },
            { userId: userId, friendId: context.userId }
          ],
          status: 'accepted'
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
        message: error.message,
        profile: null,
      };
    }
  },

  getFriendSuggestions: async (_: any, { limit = 10 }: { limit: number }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      // Get current user's connections
      const currentConnections = await FriendConnection.find({
        $or: [
          { userId: context.userId },
          { friendId: context.userId }
        ]
      }).select('userId friendId');

      // Get connected user IDs
      const connectedUserIds = new Set(
        currentConnections.flatMap(conn => [conn.userId, conn.friendId])
      );

      // Get current user's profile
      const userProfile = await FriendProfile.findOne({ userId: context.userId });

      // Find profiles with similar interests or education
      const suggestions = await FriendProfile.find({
        userId: { $ne: context.userId, $nin: Array.from(connectedUserIds) },
        visibility: 'public',
        $or: [
          { interests: { $in: userProfile?.interests || [] } },
          { 'education.institute': { $in: userProfile?.education?.map(e => e.institute) || [] } }
        ]
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
        message: error.message,
        suggestions: [],
        total: 0,
      };
    }
  },

  getNetworkStats: async (_: any, __: any, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const [totalConnections, pendingRequests] = await Promise.all([
        FriendConnection.countDocuments({
          $or: [
            { userId: context.userId },
            { friendId: context.userId }
          ],
          status: 'accepted'
        }),
        FriendConnection.countDocuments({
          friendId: context.userId,
          status: 'pending'
        })
      ]);

      const userProfile = await FriendProfile.findOne({ userId: context.userId });
      const connectedProfiles = await FriendProfile.find({
        userId: {
          $in: (await FriendConnection.find({
            $or: [
              { userId: context.userId },
              { friendId: context.userId }
            ],
            status: 'accepted'
          })).map(conn => 
            conn.userId === context.userId ? conn.friendId : conn.userId
          )
        }
      });

      const commonInterests = new Set(
        connectedProfiles.flatMap(profile => 
          profile.interests?.filter(interest => 
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
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        stats: {
          totalConnections: 0,
          pendingRequests: 0,
          mutualFriends: 0,
          commonInterests: 0,
          commonGroups: 0,
        }
      };
    }
  },
};
