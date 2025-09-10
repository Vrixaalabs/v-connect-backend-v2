import { Entity } from '@/models/Entity';
import { EntityMember } from '@/models/EntityMember';
import { GraphQLContext } from '../context';
import { createError } from '@/middleware/errorHandler';
import { BaseError } from '@/types/errors/base.error';
import {
  IGetEntitiesInput,
  IGetEntityInput,
  IGetEntityMembersInput,
  IGetEntityStatsInput,
  IEntitiesResponse,
  IEntityResponse,
  IEntityMembersResponse,
  IEntityStatsResponse,
  IEntityMember,
  IEntity,
  IEntityStatusCount,
  IEntityTypeCount,
  IEntityRequest,
  IGetEntityRequestsResponse,
  IGetEntityRequestsInput,
} from './entity.interfaces';
import { EntityChat } from '@/models/EntityChat';
import { EntityRequest } from '@/models/EntityRequest';

export const entityQueries = {
  getEntities: async (
    _: unknown,
    { organizationId, type, status, page = 1, limit = 10 }: IGetEntitiesInput,
    { isAuthenticated }: GraphQLContext
  ): Promise<IEntitiesResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const query: { organizationId: string; type?: string; status?: string } =
        {
          organizationId: organizationId || '',
        };

      if (type) {
        query.type = type.toUpperCase();
      }

      if (status) {
        query.status = status.toLowerCase();
      }

      const total = await Entity.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const entities = await Entity.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      return {
        success: true,
        message: 'Entities retrieved successfully',
        entities: entities as IEntity[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entities', {
        operation: 'getEntities',
        entityType: 'Entity',
        error,
      });
    }
  },

  // getEntityById: async (
  //   _: any,
  //   { entityId }: IGetEntityInput,
  //   { isAuthenticated, user }: GraphQLContext
  // ): Promise<IEntityResponse> => {
  //   try {
  //     if (!isAuthenticated) {
  //       throw new Error('Not authenticated');
  //     }

  //     const memberEntities = await EntityMember.find({ entityId })
  //       .lean()
  //       .exec();

  //     const [entities, users, roles] = await Promise.all([
  //       Entity.find({ entityId: { $in: memberEntities.map(me => me.entityId) } }).lean().exec(),
  //       User.find({ userId: { $in: memberEntities.map(me => me.userId) } }).lean().exec(),
  //       Role.find({ roleId: { $in: memberEntities.map(me => me.roleId) } }).lean().exec()
  //     ]);

  //     // Create a map for quick lookups
  //     const userMap = new Map(users.map(user => [user.userId, user]));
  //     const roleMap = new Map(roles.map(role => [role.roleId, role]));

  //     // Combine the data
  //     const enrichedEntities = entities.map(entity => {
  //       const memberEntity = memberEntities.find(me => me.entityId === entity.entityId);
  //       return {
  //         ...entity,
  //         member: {
  //           user: memberEntity?.userId ? userMap.get(memberEntity.userId) : null,
  //           role: memberEntity?.roleId ? roleMap.get(memberEntity.roleId) : null,
  //           joinedAt: memberEntity?.joinedAt,
  //           status: memberEntity?.status
  //         }
  //       };
  //     });
  //     console.log(enrichedEntities);

  //     return {
  //       success: true,
  //       message: 'Entities retrieved successfully',
  //       entity: enrichedEntities as IEntity,
  //       total: enrichedEntities.length,
  //       page: 1,
  //       limit: enrichedEntities.length,
  //       totalPages: 1,
  //     };
  //   } catch (error) {
  //     if (error instanceof BaseError) {
  //       throw error;
  //     }
  //     throw createError.database('Failed to get entity by ID', {
  //       operation: 'getEntityById',
  //       entityType: 'Entity',
  //       error,
  //     });
  //   }
  // },

  getEntityByEntityId: async (
    _: unknown,
    { entityId }: IGetEntityInput,
    context: GraphQLContext
  ): Promise<IEntityResponse> => {
    try {
      if (!context.isAuthenticated || !context.user) {
        throw createError.authentication('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });

      if (!entity) {
        throw createError.notFound('Entity not found', {
          entityType: 'Entity',
          entityId,
        });
      }

      const entityChat = await EntityChat.findOne({
        entityId: entity?.entityId,
      });

      if (!entityChat) {
        throw createError.notFound('Entity chat not found', {
          entityType: 'EntityChat',
          entityId,
        });
      }
      entity.entityChatId = entityChat.entityChatId;

      return {
        success: true,
        message: 'Entity retrieved successfully',
        entity: entity as IEntity,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entity by entityId', {
        operation: 'getEntityByEntityId',
        entityType: 'Entity',
        error,
      });
    }
  },

  getUserEntities: async (
    _: unknown,
    __: unknown,
    context: GraphQLContext
  ): Promise<IEntitiesResponse> => {
    try {
      if (!context.isAuthenticated || !context.user) {
        throw createError.authentication('Not authenticated');
      }

      const memberEntities = await EntityMember.find({
        userId: context.user.id,
      })
        .lean()
        .exec();

      console.log('memberEntities', memberEntities);

      if (memberEntities.length === 0) {
        return {
          success: true,
          message: 'Entities retrieved successfully',
          entities: [],
          total: 0,
          page: 1,
          limit: 0,
          totalPages: 0,
        };
      }

      const entities = await Entity.find({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entityId: { $in: memberEntities.map((me: any) => me.entityId) },
      })
        .lean()
        .exec();

      if (entities.length === 0) {
        return {
          success: true,
          message: 'Entities retrieved successfully',
          entities: [],
          total: 0,
          page: 1,
          limit: 0,
          totalPages: 0,
        };
      }

      return {
        success: true,
        message: 'Entities retrieved successfully',
        entities: entities as IEntity[],
        total: entities.length,
        page: 1,
        limit: entities.length,
        totalPages: 1,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get user entities', {
        operation: 'getUserEntities',
        entityType: 'EntityMembers',
        error,
      });
    }
  },

  // getEntityMembers: async (
  //   _: unknown,
  //   { entityId, status, role, page = 1, limit = 10 }: IGetEntityMembersInput,
  //   { isAuthenticated }: GraphQLContext
  // ): Promise<IEntityMembersResponse> => {
  //   try {
  //     if (!isAuthenticated) {
  //       throw new Error('Not authenticated');
  //     }

  //     const entity = await Entity.findOne({ entityId });
  //     if (!entity) {
  //       throw new Error('Entity not found');
  //     }

  //     const entityMembers = entity.get('members') || [];
  //     let filteredMembers = [...entityMembers];

  //     if (status) {
  //       filteredMembers = filteredMembers.filter(
  //         (member: IEntityMember) => member.status === status.toUpperCase()
  //       ) as IEntityMember[];
  //     }

  //     if (role) {
  //       filteredMembers = filteredMembers.filter(
  //         (member: IEntityMember) => member.role === role.toUpperCase()
  //       ) as IEntityMember[];
  //     }

  //     const total = filteredMembers.length;
  //     const totalPages = Math.ceil(total / limit);
  //     const paginatedMembers = filteredMembers.slice(
  //       (page - 1) * limit,
  //       page * limit
  //     );

  //     // Convert to IEntityMember array
  //     const members: IEntityMember[] = paginatedMembers.map(
  //       (member: IEntityMember) => ({
  //         userId: member.userId,
  //         role: member.role,
  //         joinedAt: member.joinedAt,
  //         status: member.status as MemberStatus,
  //       })
  //     );

  //     return {
  //       success: true,
  //       message: 'Members retrieved successfully',
  //       members,
  //       total,
  //       page,
  //       limit,
  //       totalPages,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message:
  //         error instanceof Error ? error.message : 'An unknown error occurred',
  //       members: [],
  //       total: 0,
  //       page,
  //       limit,
  //       totalPages: 0,
  //     };
  //   }
  // },

  getEntityMembers: async (
    _: unknown,
    { entityId }: IGetEntityMembersInput,
    context: GraphQLContext
  ): Promise<IEntityMembersResponse> => {
    if (!context.isAuthenticated || !context.user) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const entityMembers = await EntityMember.aggregate([
        { $match: { entityId } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'roles',
            localField: 'roleId',
            foreignField: 'roleId',
            as: 'role',
          },
        },
        { $unwind: '$role' },
        {
          $project: {
            user: {
              userId: '$user.userId',
              firstName: '$user.firstName',
              lastName: '$user.lastName',
              avatar: '$user.avatar',
            },
            role: {
              roleId: 1,
              name: 1,
              permissions: 1,
            },
            joinedAt: '$joinedAt',
            status: '$status',
          },
        },
      ]);

      console.log('entityMembers', entityMembers);

      return {
        success: true,
        message: 'Entity members retrieved successfully',
        members: entityMembers as IEntityMember[],
        total: entityMembers.length,
        page: 1,
        limit: entityMembers.length,
        totalPages: 1,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entity members', {
        operation: 'getEntityMembers',
        entityType: 'Entity',
        error,
      });
    }
  },

  getEntityStats: async (
    _: unknown,
    { organizationId }: IGetEntityStatsInput,
    { isAuthenticated }: GraphQLContext
  ): Promise<IEntityStatsResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const [
        totalEntities,
        entitiesByType,
        entitiesByStatus,
        totalMembers,
        activeMembers,
      ] = await Promise.all([
        Entity.countDocuments({ organizationId: organizationId || '' }),
        Entity.aggregate([
          { $match: { organizationId: organizationId || '' } },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { $group: { _id: '$type' as any, count: { $sum: 1 } } },
        ]),
        Entity.aggregate([
          { $match: { organizationId } },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { $group: { _id: '$status' as any, count: { $sum: 1 } } },
        ]),
        Entity.aggregate([
          { $match: { organizationId } },
          { $unwind: '$members' },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]),
        Entity.aggregate([
          { $match: { organizationId: organizationId || '' } },
          { $unwind: '$members' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { $match: { 'members.status': 'active' as any } },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]),
      ]);

      const stats = {
        totalEntities,
        entitiesByType: entitiesByType.map((item: IEntityTypeCount) => ({
          type: item.type,
          count: item.count,
        })),
        entitiesByStatus: entitiesByStatus.map((item: IEntityStatusCount) => ({
          status: item.status,
          count: item.count,
        })),
        totalMembers: totalMembers[0]?.total || 0,
        activeMembers: activeMembers[0]?.total || 0,
        averageMembersPerEntity: totalEntities
          ? (totalMembers[0]?.total || 0) / totalEntities
          : 0,
      };

      return {
        success: true,
        message: 'Entity stats retrieved successfully',
        stats,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        stats: {
          totalEntities: 0,
          entitiesByType: [],
          entitiesByStatus: [],
          totalMembers: 0,
          activeMembers: 0,
          averageMembersPerEntity: 0,
        },
      };
    }
  },
  getEntityRequests: async (
    _: unknown,
    { entityId }: IGetEntityRequestsInput,
    context: GraphQLContext
  ): Promise<IGetEntityRequestsResponse> => {
    if (!context.isAuthenticated || !context.user) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const entityRequests = await EntityRequest.find({ entityId: entityId });

      return {
        success: true,
        message: 'Entity requests retrieved successfully',
        entityRequests: entityRequests as IEntityRequest[],
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entity requests', {
        operation: 'getEntityRequests',
        entityType: 'EntityRequest',
        error,
      });
    }
  },
  getAllEntities: async (
    _: unknown,
    __: unknown,
    context: GraphQLContext
  ): Promise<IEntitiesResponse> => {
    if (!context.isAuthenticated || !context.user) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const entities = await Entity.find();

      return {
        success: true,
        message: 'Entities retrieved successfully',
        entities: entities as IEntity[],
        total: entities.length,
        page: 1,
        limit: entities.length,
        totalPages: 1,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get all entities', {
        operation: 'getAllEntities',
        entityType: 'Entity',
        error,
      });
    }
  },
  getRequestByEntityId: async (
    _: unknown,
    { entityId }: IGetEntityRequestsInput,
    context: GraphQLContext
  ): Promise<IGetEntityRequestsResponse> => {
    if (!context.isAuthenticated || !context.user) {
      throw createError.authentication('Not authenticated');
    }
    try {
      const entityRequests = await EntityRequest.find({ entityId: entityId, status: 'pending' });

      console.log('entityRequests', entityRequests);

      return {
        success: true,
        message: 'Entity requests retrieved successfully',
        entityRequests: entityRequests,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entity requests', {
        operation: 'getRequestByEntityId',
        entityType: 'EntityRequest',
        error,
      });
    }
  },
};
