import { Entity } from '@/models';
import { Context } from '../context';

export const entityQueries = {
  getEntities: async (_: any, { 
    organizationId, 
    type, 
    status,
    page = 1, 
    limit = 10 
  }: { 
    organizationId: string;
    type?: string;
    status?: string;
    page: number;
    limit: number;
  }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
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
        entities,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        entities: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  getEntity: async (_: any, { entityId }: { entityId: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId })
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate('members.userId', 'firstName lastName avatar');

      if (!entity) {
        throw new Error('Entity not found');
      }

      // Check visibility permissions
      if (entity.settings.visibility === 'private') {
        const isMember = entity.members?.some(member => 
          member.userId === context.userId && member.status === 'active'
        );

        if (!isMember) {
          throw new Error('Access denied');
        }
      }

      return {
        success: true,
        message: 'Entity retrieved successfully',
        entity,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        entity: null,
      };
    }
  },

  getEntityMembers: async (_: any, { 
    entityId,
    status,
    role,
    page = 1,
    limit = 10
  }: {
    entityId: string;
    status?: string;
    role?: string;
    page: number;
    limit: number;
  }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const entity = await Entity.findOne({ entityId });
      if (!entity) {
        throw new Error('Entity not found');
      }

      let members = entity.members || [];

      if (status) {
        members = members.filter(member => member.status === status.toLowerCase());
      }

      if (role) {
        members = members.filter(member => member.role === role);
      }

      const total = members.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedMembers = members.slice((page - 1) * limit, page * limit);

      // Populate user details
      const populatedMembers = await Entity.populate(paginatedMembers, {
        path: 'userId',
        select: 'firstName lastName avatar email',
      });

      return {
        success: true,
        message: 'Members retrieved successfully',
        members: populatedMembers,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        members: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  getEntityStats: async (_: any, { organizationId }: { organizationId: string }, context: Context) => {
    try {
      if (!context.isAuthenticated) {
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
        entitiesByType: entitiesByType.map(item => ({
          type: item._id,
          count: item.count
        })),
        entitiesByStatus: entitiesByStatus.map(item => ({
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
        message: error.message,
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
