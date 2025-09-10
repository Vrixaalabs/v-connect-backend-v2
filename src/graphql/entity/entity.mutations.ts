import { Entity } from '@/models/Entity';
import { GraphQLContext } from '../context';
import { BaseError } from '@/types/errors/base.error';
import { createError } from '@/middleware/errorHandler';
import {
  EntityStatus,
  EntityVisibility,
  MemberStatus,
  IEntity,
  IEntityRequest,
} from './entity.interfaces';
import {
  ICreateEntityMutationInput,
  IUpdateEntityMutationInput,
  IEntityResponse,
  IEntityMemberResponse,
  ICreateEntityRequestMutationInput,
  IEntityRequestResponse,
  IAcceptEntityJoinRequestMutationInput,
  IRejectEntityJoinRequestMutationInput,
} from './entity.interfaces';
import { EntityMember } from '@/models/EntityMember';
import { Role } from '@/models/Role';
import { EntityChat } from '@/models/EntityChat';
import { EntityRequest } from '@/models/EntityRequest';

export const entityMutations = {
  createEntity: async (
    _: unknown,
    { input }: ICreateEntityMutationInput,
    context: GraphQLContext
  ): Promise<IEntityResponse> => {
    try {
      if (!context.isAuthenticated || !context.user) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.create({
        ...input,
        createdBy: context.user.id,
        status: EntityStatus.ACTIVE,
        settings: {
          allowMembershipRequests: true,
          requireApproval: true,
          visibility: EntityVisibility.ORGANIZATION,
          allowPosts: true,
          allowEvents: true,
          allowAnnouncements: true,
          ...input.settings,
        },
        metadata: {
          totalMembers: 0,
          totalPosts: 0,
          totalEvents: 0,
          lastActivityAt: new Date(),
        },
      });

      // Find or create the Entity Owner role
      let role = await Role.findOne({ name: 'Entity Owner' });
      if (!role) {
        role = await Role.create({
          name: 'Entity Owner',
          description: 'Entity Owner',
          permissions: [
            {
              resource: 'entity',
              actions: ['create', 'read', 'update', 'delete', 'manage'],
            },
          ],
        });
      }

      // Create entity member record
      await EntityMember.create({
        entityId: entity.entityId,
        userId: context.user.id,
        roleId: role.roleId,
        status: MemberStatus.ACTIVE,
      });

      await EntityChat.create({
        entityId: entity.entityId,
        userId: context.user.id,
      });

      return {
        success: true,
        message: 'Entity created successfully',
        entity: entity as IEntity,
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

  updateEntity: async (
    _: unknown,
    { id, input }: IUpdateEntityMutationInput,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<IEntityResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      if (!user) {
        throw new Error('User not found');
      }

      const entity = await Entity.findOne({ entityId: id });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to update
      // const entityMember = await EntityMember.findOne({
      //   entityId: id,
      //   userId: user.id,
      //   status: MemberStatus.ACTIVE,
      // }).populate('roleId', 'name');

      // if (
      //   !entityMember ||
      //   !['admin', 'moderator'].includes(entityMember.roleId.name.toLowerCase())
      // ) {
      //   throw new Error('Permission denied');
      // }

      // Update the entity
      if (input.settings) {
        const currentSettings = entity.get('settings') || {};
        input.settings = {
          ...currentSettings,
          ...input.settings,
        };
      }

      entity.set({
        ...input,
        updatedBy: user.id,
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

  // addEntityMember: async (
  //   _: unknown,
  //   { input }: IAddEntityMemberMutationInput,
  //   { isAuthenticated, user }: GraphQLContext
  // ): Promise<IEntityMemberResponse> => {
  //   try {
  //     if (!isAuthenticated) {
  //       throw new Error('Not authenticated');
  //     }

  //     const entity = await Entity.findOne({ entityId: input.entityId });
  //     if (!entity) {
  //       throw new Error('Entity not found');
  //     }

  //     // Check if user has permission to add members
  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     const members = entity.get('members') || [];
  //     // const isAdmin = members.some(
  //     //   member =>
  //     //     member.userId === user.id &&
  //     //     member.status === MemberStatus.ACTIVE &&
  //     //     member.role.toLowerCase() === 'admin'
  //     // );

  //     // if (!isAdmin) {
  //     //   throw new Error('Permission denied');
  //     // }

  //     // // Check if user is already a member
  //     // if (members.some(member => member.userId === input.userId)) {
  //     //   throw new Error('User is already a member');
  //     // }

  //     const newMember = {
  //       userId: input.userId,
  //       role: input.role,
  //       joinedAt: new Date(),
  //       status: MemberStatus.ACTIVE,
  //     };

  //     entity.set('members', [...members, newMember]);

  //     const metadata = entity.get('metadata') || {
  //       totalMembers: 0,
  //       totalPosts: 0,
  //       totalEvents: 0,
  //       lastActivityAt: new Date(),
  //     };
  //     entity.set('metadata', {
  //       ...metadata,
  //       totalMembers: metadata.totalMembers + 1,
  //       lastActivityAt: new Date(),
  //     } as IEntityMetadata);

  //     await entity.save();

  //     return {
  //       success: true,
  //       message: 'Member added successfully',
  //       member: newMember,
  //     };
  //   } catch (error) {
  //     if (error instanceof BaseError) {
  //       throw error;
  //     }
  //     throw createError.database('Failed to add entity member', {
  //       operation: 'add',
  //       entityType: 'Entity',
  //       error,
  //     });
  //   }
  // },

  // updateEntityMember: async (
  //   _: unknown,
  //   __: unknown,
  //   { isAuthenticated }: GraphQLContext
  // ): Promise<IEntityMemberResponse> => {
  //   try {
  //     if (!isAuthenticated) {
  //       throw new Error('Not authenticated');
  //     }

  //     const entity = await Entity.findOne({ entityId: '' });
  //     if (!entity) {
  //       throw new Error('Entity not found');
  //     }

  //     // Check if user has permission to update members
  //     // const isAdmin = entity.members?.some(
  //     //   member =>
  //     //     member.userId === user?.id &&
  //     //     member.status === MemberStatus.ACTIVE &&
  //     //     member.role.toLowerCase() === 'admin'
  //     // );

  //     // if (!isAdmin) {
  //     //   throw new Error('Permission denied');
  //     // }

  //     // const memberIndex = entity.members?.findIndex(
  //     //   member => member.userId === userId
  //     // );
  //     // if (memberIndex === -1) {
  //     //   throw new Error('Member not found');
  //     // }

  //     // const updatedMember = {
  //     //   ...entity.members[memberIndex],
  //     //   ...input,
  //     // };

  //     // entity.members[memberIndex] = updatedMember;

  //     // // Update metadata if status changed
  //     // if (input.status && input.status !== entity.members[memberIndex].status) {
  //     //   entity.metadata = {
  //     //     ...entity.metadata,
  //     //     totalMembers: members.filter(m => m.status === MemberStatus.ACTIVE)
  //     //       .length,
  //     //     lastActivityAt: new Date(),
  //     //   };
  //     // }

  //     await entity.save();

  //     return {
  //       success: true,
  //       message: 'Member updated successfully',
  //       member: {
  //         userId: '',
  //         role: '',
  //         joinedAt: new Date(),
  //         status: MemberStatus.ACTIVE,
  //       },
  //     };
  //   } catch (error) {
  //     if (error instanceof BaseError) {
  //       throw error;
  //     }
  //     throw createError.database('Failed to update entity member', {
  //       operation: 'update',
  //       entityType: 'Entity',
  //       error,
  //     });
  //   }
  // },

  removeEntityMember: async (
    _: unknown,
    __: unknown,
    { isAuthenticated }: GraphQLContext
  ): Promise<IEntityMemberResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId: '' });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to remove members
      // const isAdmin = entity.members?.some(
      //   member =>
      //     member.userId === user?.id &&
      //     member.status === MemberStatus.ACTIVE &&
      //     member.role.toLowerCase() === 'admin'
      // );

      // // Allow users to remove themselves
      // const isSelf = user?.id === userId;

      // if (!isAdmin && !isSelf) {
      //   throw new Error('Permission denied');
      // }

      // const memberIndex = entity.members?.findIndex(
      //   member => member.userId === userId
      // );
      // if (memberIndex === -1) {
      //   throw new Error('Member not found');
      // }

      // const members = entity.get('members') || [];
      // members.splice(memberIndex, 1);
      // entity.set('members', members);
      // entity.metadata = {
      //   ...entity.metadata,
      //   totalMembers: members.filter(m => m.status === MemberStatus.ACTIVE)
      //     .length,
      //   lastActivityAt: new Date(),
      // };

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

  archiveEntity: async (
    _: unknown,
    __: unknown,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<IEntityResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId: '' });
      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check if user has permission to archive
      // const isAdmin = entity.members?.some(
      //   member =>
      //     member.userId === user?.id &&
      //     member.status === MemberStatus.ACTIVE &&
      //     member.role.toLowerCase() === 'admin'
      // );

      // if (!isAdmin) {
      //   throw new Error('Permission denied');
      // }

      entity.set('status', EntityStatus.ARCHIVED);
      entity.set('updatedBy', user?.id || '');
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
  createEntityRequest: async (
    _: unknown,
    { input }: ICreateEntityRequestMutationInput,
    context: GraphQLContext
  ): Promise<IEntityRequestResponse> => {
    try {
      const entityRequest = await EntityRequest.create({
        ...input,
        userId: context.user?.id as string,
        status: 'pending',
        metadata: input.metadata,
      });

      return {
        success: true,
        message: 'Entity request created successfully',
        entityRequest,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create entity request', {
        operation: 'create',
        entityType: 'EntityRequest',
        error,
      });
    }
  },
  acceptEntityJoinRequest: async (
    _: unknown,
    { requestId }: IAcceptEntityJoinRequestMutationInput,
    context: GraphQLContext
  ): Promise<IEntityRequestResponse> => {
    try {
      const entityRequest = await EntityRequest.findOneAndUpdate(
        { 
          entityRequestId: requestId, 
          status: 'pending' 
        },
        { $set: { status: 'accepted' } },
        { new: true }
      );

      if (!entityRequest) {
        throw createError.notFound('Entity request not found', {
          entityType: 'EntityRequest',
          entityRequestId: requestId,
        });
      }

      // add user to entitymembers
      await EntityMember.create({
        userId: entityRequest.userId,
        entityId: entityRequest.entityId,
        roleId: '7e194669-d391-4e58-8279-3695285fdd04',
        status: MemberStatus.ACTIVE,
      });

      // update entity metadata
      const entity = await Entity.findOne({ entityId: entityRequest.entityId });
      if (!entity) {
        throw createError.notFound('Entity not found', {
          entityType: 'Entity',
          entityId: entityRequest.entityId,
        });
      }

      if (entity.metadata) {
        entity.metadata.totalMembers++;
      } else {
        entity.metadata = {
          totalMembers: 1,
          totalPosts: 0,
          totalEvents: 0,
          lastActivityAt: new Date(),
        };
      }
      await entity.save();

      return {
        success: true,
        message: 'Entity request accepted successfully',
        entityRequest: entityRequest as IEntityRequest,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to accept entity request', {
        operation: 'accept',
        entityType: 'EntityRequest',
        entityRequestId: requestId,
        error,
      });
    }
  },
  rejectEntityJoinRequest: async (
    _: unknown,
    { requestId }: IRejectEntityJoinRequestMutationInput,
    context: GraphQLContext
  ): Promise<IEntityRequestResponse> => {
    try {
      const entityRequest = await EntityRequest.findOneAndUpdate(
        { requestId, status: 'pending' },
        { $set: { status: 'rejected' } },
        { new: true }
      );

      return {
        success: true,
        message: 'Entity request rejected successfully',
        entityRequest: entityRequest as IEntityRequest,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to reject entity request', {
        operation: 'reject',
        entityType: 'EntityRequest',
        requestId,
        error,
      });
    }
  },
};
