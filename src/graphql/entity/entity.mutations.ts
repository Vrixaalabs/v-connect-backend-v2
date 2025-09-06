import { Entity } from '@/models/Entity';
import { GraphQLContext } from '../context';   
import { BaseError } from '@/types/errors/base.error';
import { createError } from '@/middleware/errorHandler';

export const entityMutations = {
  createEntity: async (
    _: any, 
    { input }: { input: any }, 
    { isAuthenticated, user }: GraphQLContext
  ) => {
    try {
      if (isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.create({
        ...input,
        createdBy: user?.id,
      });

      return {
        success: true,
        message: 'Entity created successfully',
        entity,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create entity', {
        operation: 'create',
        entityType: 'Entity',
        error,
      });
    }
  },

  updateEntity: async (_: any, { entityId, input }: { entityId: string; input: any }, { isAuthenticated, user }: GraphQLContext) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to update
      const isMember = entity.members?.some(member => 
        member.userId === user?.id && 
        member.status === 'active' &&
        ['admin', 'moderator'].includes(member.role.toLowerCase())
      );

      if (!isMember) {
        throw new Error('Permission denied');
      }

      Object.assign(entity, {
        ...input,
        updatedBy: user?.id,
      });

      await entity.save();

      return {
        success: true,
        message: 'Entity updated successfully',
        entity,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update entity', {
        operation: 'update',
        entityType: 'Entity',
        error,
      });
    }
  },

  addEntityMember: async (_: any, { 
    entityId, 
    input 
  }: { 
    entityId: string; 
    input: { userId: string; role: string; } 
  }, { isAuthenticated, user }: GraphQLContext) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to add members
      const isAdmin = entity.members?.some(member => 
        member.userId === user?.id && 
        member.status === 'active' &&
        member.role.toLowerCase() === 'admin'
      );

      if (!isAdmin) {
        throw new Error('Permission denied');
      }

      // Check if user is already a member
      if (entity.members?.some(member => member.userId === input.userId)) {
        throw new Error('User is already a member');
      }

      const newMember = {
        userId: input.userId,
        role: input.role,
        joinedAt: new Date(),
        status: 'active',
      };

      entity.members = [...(entity.members || []), newMember];
      entity.metadata = {
        ...entity.metadata,
        totalMembers: (entity.metadata?.totalMembers || 0) + 1,
        lastActivityAt: new Date(),
      };

      await entity.save();

      return {
        success: true,
        message: 'Member added successfully',
        member: newMember,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to add entity member', {
        operation: 'add',
        entityType: 'Entity',
        error,
      });
    }
  },

  updateEntityMember: async (_: any, { 
    entityId, 
    userId, 
    input 
  }: { 
    entityId: string; 
    userId: string;
    input: { role?: string; status?: string; } 
  }, { isAuthenticated, user }: GraphQLContext) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to update members
      const isAdmin = entity.members?.some(member => 
        member.userId === user?.id && 
        member.status === 'active' &&
        member.role.toLowerCase() === 'admin'
      );

      if (!isAdmin) {
        throw new Error('Permission denied');
      }

      const memberIndex = entity.members?.findIndex(member => member.userId === userId);
      if (memberIndex === -1) {
        throw new Error('Member not found');
      }

      const updatedMember = {
        ...entity.members[memberIndex],
        ...input,
      };

      entity.members[memberIndex] = updatedMember;

      // Update metadata if status changed
      if (input.status && input.status !== entity.members[memberIndex].status) {
        entity.metadata = {
          ...entity.metadata,
          totalMembers: entity.members.filter(m => m.status === 'active').length,
          lastActivityAt: new Date(),
        };
      }

      await entity.save();

      return {
        success: true,
        message: 'Member updated successfully',
        member: updatedMember,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update entity member', {
        operation: 'update',
        entityType: 'Entity',
        error,
      });
    }
  },

  removeEntityMember: async (_: any, { 
    entityId, 
    userId 
  }: { 
    entityId: string; 
    userId: string;
  }, { isAuthenticated, user }: GraphQLContext) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to remove members
      const isAdmin = entity.members?.some(member => 
        member.userId === user?.id && 
        member.status === 'active' &&
        member.role.toLowerCase() === 'admin'
      );

      // Allow users to remove themselves
      const isSelf = user?.id === userId;

      if (!isAdmin && !isSelf) {
        throw new Error('Permission denied');
      }

      const memberIndex = entity.members?.findIndex(member => member.userId === userId);
      if (memberIndex === -1) {
        throw new Error('Member not found');
      }

      entity.members.splice(memberIndex, 1);
      entity.metadata = {
        ...entity.metadata,
        totalMembers: entity.members.filter(m => m.status === 'active').length,
        lastActivityAt: new Date(),
      };

      await entity.save();

      return {
        success: true,
        message: 'Member removed successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to remove entity member', {
        operation: 'remove',
        entityType: 'Entity',
        error,
      });
    }
  },

  archiveEntity: async (_: any, { entityId }: { entityId: string }, { isAuthenticated, user }: GraphQLContext) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to archive
      const isAdmin = entity.members?.some(member => 
        member.userId === user?.id && 
        member.status === 'active' &&
        member.role.toLowerCase() === 'admin'
      );

      if (!isAdmin) {
        throw new Error('Permission denied');
      }

      entity.status = 'archived';
      entity.updatedBy = user?.id;
      await entity.save();

      return {
        success: true,
        message: 'Entity archived successfully',
        entity,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to archive entity', {
        operation: 'archive',
        entityType: 'Entity',
        error,
      });
    }
  },
};
