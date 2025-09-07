import { Entity } from '@/models/Entity';
import { EntityMember } from '@/models/EntityMember';
import { User } from '@/models/User';
import { Role } from '@/models/Role';
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
  EntityVisibility,
  MemberStatus,
} from './entity.interfaces';

export const entityQueries = {
  getEntities: async (
    _: any,
    { organizationId, type, status, page = 1, limit = 10 }: IGetEntitiesInput,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<IEntitiesResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const query: any = { organizationId };

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

  getEntityById: async (
    _: any,
    { entityId }: IGetEntityInput,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<IEntityResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const memberEntities = await EntityMember.find({ entityId })
        .lean()
        .exec();

      const [entities, users, roles] = await Promise.all([
        Entity.find({ entityId: { $in: memberEntities.map(me => me.entityId) } }).lean().exec(),
        User.find({ userId: { $in: memberEntities.map(me => me.userId) } }).lean().exec(),
        Role.find({ roleId: { $in: memberEntities.map(me => me.roleId) } }).lean().exec()
      ]);

      // Create a map for quick lookups
      const userMap = new Map(users.map(user => [user.userId, user]));
      const roleMap = new Map(roles.map(role => [role.roleId, role]));

      // Combine the data
      const enrichedEntities = entities.map(entity => {
        const memberEntity = memberEntities.find(me => me.entityId === entity.entityId);
        return {
          ...entity,
          member: {
            user: memberEntity?.userId ? userMap.get(memberEntity.userId) : null,
            role: memberEntity?.roleId ? roleMap.get(memberEntity.roleId) : null,
            joinedAt: memberEntity?.joinedAt,
            status: memberEntity?.status
          }
        };
      });
      console.log(enrichedEntities);

      return {
        success: true,
        message: 'Entities retrieved successfully',
        entity: enrichedEntities as IEntity,
        total: enrichedEntities.length,
        page: 1,
        limit: enrichedEntities.length,
        totalPages: 1,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get entity by ID', {
        operation: 'getEntityById',
        entityType: 'Entity',
        error,
      });
    }
  },

  getUserEntities: async (
    _: any,
    __: any,
    context: GraphQLContext
  ): Promise<IEntitiesResponse> => {
    try {
      if (!context.isAuthenticated || !context.user) {
        throw createError.authentication('Not authenticated');
      }
      console.log(context.user.id);

      const memberEntities = await EntityMember.find({ userId: context.user.id })
        .lean()
        .exec();
      console.log('Member Entities:', memberEntities);

     const entities = await Entity.find({ entityId: { $in: memberEntities.map(me => me.entityId) } })
        .lean()
        .exec();

      return {
        success: true,
        message: 'Entities retrieved successfully',
        entities: entities as IEntity[],
        total: entities.length,
        page: 1,
        limit: entities.length,
        totalPages: 1,
      };
    }
  catch (error) {
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

  getEntityMembers: async (
    _: any,
    { entityId, status, role, page = 1, limit = 10 }: IGetEntityMembersInput,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<IEntityMembersResponse> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      const entityMembers = entity.get('members') || [];
      let filteredMembers = [...entityMembers];

      if (status) {
        filteredMembers = filteredMembers.filter((member: IEntityMember) => 
          member.status === (status.toUpperCase() as MemberStatus)
        );
      }

      if (role) {
        filteredMembers = filteredMembers.filter((member: IEntityMember) => 
          member.role === role
        );
      }

      const total = filteredMembers.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedMembers = filteredMembers.slice((page - 1) * limit, page * limit);

      // Convert to IEntityMember array
      const members: IEntityMember[] = paginatedMembers.map(member => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        status: member.status as MemberStatus,
      }));

      return {
        success: true,
        message: 'Members retrieved successfully',
        members,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        members: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  getEntityStats: async (
    _: any,
    { organizationId }: IGetEntityStatsInput,
    { isAuthenticated, user }: GraphQLContext
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
        activeMembers
      ] = await Promise.all([
        Entity.countDocuments({ organizationId }),
        Entity.aggregate([
          { $match: { organizationId } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Entity.aggregate([
          { $match: { organizationId } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Entity.aggregate([
          { $match: { organizationId } },
          { $unwind: '$members' },
          { $group: { _id: null, total: { $sum: 1 } } }
        ]),
        Entity.aggregate([
          { $match: { organizationId } },
          { $unwind: '$members' },
          { $match: { 'members.status': 'active' } },
          { $group: { _id: null, total: { $sum: 1 } } }
        ])
      ]);

      const stats = {
        totalEntities,
        entitiesByType: entitiesByType.map((item: any) => ({
          type: item._id,
          count: item.count
        })),
        entitiesByStatus: entitiesByStatus.map((item: any) => ({
          status: item._id,
          count: item.count
        })),
        totalMembers: totalMembers[0]?.total || 0,
        activeMembers: activeMembers[0]?.total || 0,
        averageMembersPerEntity: totalEntities ? (totalMembers[0]?.total || 0) / totalEntities : 0
      };

      return {
        success: true,
        message: 'Entity stats retrieved successfully',
        stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stats: {
          totalEntities: 0,
          entitiesByType: [],
          entitiesByStatus: [],
          totalMembers: 0,
          activeMembers: 0,
          averageMembersPerEntity: 0
        }
      };
    }
  },
};
