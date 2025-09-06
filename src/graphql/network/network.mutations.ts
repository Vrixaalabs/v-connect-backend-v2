import { FriendConnection } from '@/models/FriendConnection';
import { FriendProfile } from '@/models/FriendProfile';
import { GraphQLContext } from '../context';    

export const networkMutations = {
  createFriendConnection: async (
    _: any, { input }: { input: { friendId: string } }, context: GraphQLContext) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      // Check if connection already exists
      const existingConnection = await FriendConnection.findOne({
        $or: [
          { userId: context.userId, friendId: input.friendId },
          { userId: input.friendId, friendId: context.userId }
        ]
      });

      if (existingConnection) {
        throw new Error('Connection already exists');
      }

      // Create new connection
      const connection = await FriendConnection.create({
        userId: context.userId,
        friendId: input.friendId,
        status: 'pending',
        initiatedBy: context.userId,
      });

      return {
        success: true,
        message: 'Friend request sent successfully',
        connection,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        connection: null,
      };
    }
  },

  updateFriendConnection: async (_: any, { connectionId, input }: { connectionId: string; input: { status: string } }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const connection = await FriendConnection.findOne({
        connectionId,
        friendId: context.userId,
        status: 'pending'
      });

      if (!connection) {
        throw new Error('Connection not found or already processed');
      }

      connection.status = input.status.toLowerCase();
      
      if (input.status === 'blocked') {
        connection.blockedBy = context.userId;
        connection.blockedAt = new Date();
      }

      await connection.save();

      return {
        success: true,
        message: 'Connection updated successfully',
        connection,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        connection: null,
      };
    }
  },

  updateFriendProfile: async (_: any, { input }: { input: any }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      let profile = await FriendProfile.findOne({ userId: context.userId });

      if (!profile) {
        // Create new profile if it doesn't exist
        profile = await FriendProfile.create({
          userId: context.userId,
          ...input,
        });
      } else {
        // Update existing profile
        Object.assign(profile, input);
        await profile.save();
      }

      return {
        success: true,
        message: 'Profile updated successfully',
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

  removeFriendConnection: async (_: any, { connectionId }: { connectionId: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const connection = await FriendConnection.findOne({
        connectionId,
        $or: [
          { userId: context.userId },
          { friendId: context.userId }
        ]
      });

      if (!connection) {
        throw new Error('Connection not found');
      }

      await connection.deleteOne();

      return {
        success: true,
        message: 'Connection removed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  blockUser: async (_: any, { userId }: { userId: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      let connection = await FriendConnection.findOne({
        $or: [
          { userId: context.userId, friendId: userId },
          { userId: userId, friendId: context.userId }
        ]
      });

      if (!connection) {
        // Create new blocked connection if none exists
        connection = await FriendConnection.create({
          userId: context.userId,
          friendId: userId,
          status: 'blocked',
          initiatedBy: context.userId,
          blockedBy: context.userId,
          blockedAt: new Date(),
        });
      } else {
        // Update existing connection to blocked
        connection.status = 'blocked';
        connection.blockedBy = context.userId;
        connection.blockedAt = new Date();
        await connection.save();
      }

      return {
        success: true,
        message: 'User blocked successfully',
        connection,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        connection: null,
      };
    }
  },

  unblockUser: async (_: any, { userId }: { userId: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const connection = await FriendConnection.findOne({
        $or: [
          { userId: context.userId, friendId: userId },
          { userId: userId, friendId: context.userId }
        ],
        status: 'blocked',
        blockedBy: context.userId
      });

      if (!connection) {
        throw new Error('Blocked connection not found');
      }

      await connection.deleteOne();

      return {
        success: true,
        message: 'User unblocked successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },
};
