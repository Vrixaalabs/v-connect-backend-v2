import { FriendConnection } from '@/models/FriendConnection';
import { FriendProfile, IFriendProfile } from '@/models/FriendProfile';
import { GraphQLContext } from '../context';

export const networkMutations = {
  createFriendConnection: async (
    _: unknown,
    { input }: { input: { friendId: string } },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      // Check if connection already exists
      const existingConnection = await FriendConnection.findOne({
        $or: [
          { userId: context.user?.id, friendId: input.friendId },
          { userId: input.friendId, friendId: context.user?.id },
        ],
      });

      if (existingConnection) {
        throw new Error('Connection already exists');
      }

      // Create new connection
      const connection = await FriendConnection.create({
        userId: context.user?.id,
        friendId: input.friendId,
        status: 'pending',
        initiatedBy: context.user?.id,
      });

      return {
        success: true,
        message: 'Friend request sent successfully',
        connection,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        connection: null,
      };
    }
  },

  updateFriendConnection: async (
    _: unknown,
    {
      connectionId,
      input,
    }: { connectionId: string; input: { status: string } },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const connection = await FriendConnection.findOne({
        connectionId,
        friendId: context.user?.id,
        status: 'pending',
      });

      if (!connection) {
        throw new Error('Connection not found or already processed');
      }

      connection.status = input.status.toLowerCase() as
        | 'pending'
        | 'accepted'
        | 'rejected'
        | 'blocked';

      if (input.status === 'blocked') {
        connection.blockedBy = context.user?.id || '';
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
        message: error instanceof Error ? error.message : 'Unknown error',
        connection: null,
      };
    }
  },

  updateFriendProfile: async (
    _: unknown,
    { input }: { input: IFriendProfile },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      let profile = await FriendProfile.findOne({ userId: context.user?.id });

      if (!profile) {
        // Create new profile if it doesn't exist
        profile = await FriendProfile.create({
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
        message: error instanceof Error ? error.message : 'Unknown error',
        profile: null,
      };
    }
  },

  removeFriendConnection: async (
    _: unknown,
    { connectionId }: { connectionId: string },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const connection = await FriendConnection.findOne({
        connectionId,
        $or: [{ userId: context.user?.id }, { friendId: context.user?.id }],
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
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  blockUser: async (
    _: unknown,
    { userId }: { userId: string },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      let connection = await FriendConnection.findOne({
        $or: [
          { userId: context.user?.id, friendId: userId },
          { userId: userId, friendId: context.user?.id },
        ],
      });

      if (!connection) {
        // Create new blocked connection if none exists
        connection = await FriendConnection.create({
          userId: context.user?.id,
          friendId: userId,
          status: 'blocked',
          initiatedBy: context.user?.id,
          blockedBy: context.user?.id || '',
          blockedAt: new Date(),
        });
      } else {
        // Update existing connection to blocked
        connection.status = 'blocked';
        connection.blockedBy = context.user?.id || '';
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
        message: error instanceof Error ? error.message : 'Unknown error',
        connection: null,
      };
    }
  },

  unblockUser: async (
    _: unknown,
    { userId }: { userId: string },
    context: GraphQLContext
  ) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const connection = await FriendConnection.findOne({
        $or: [
          { userId: context.user?.id, friendId: userId },
          { userId: userId, friendId: context.user?.id },
        ],
        status: 'blocked',
        blockedBy: context.user?.id,
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
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
