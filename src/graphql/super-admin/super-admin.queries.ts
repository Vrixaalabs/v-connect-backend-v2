import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Institute } from '../../models/Institute';
import { OrganizationUserRole } from '../../models/OrganizationUserRole';
import { User } from '../../models/User';
import { BaseError } from '../../types/errors/base.error';
import {
  SuperAdminDashboardStats,
  RecentActivity,
  SystemStatus,
  GetRecentActivitiesArgs,
  DashboardStatsResponse,
  RecentActivitiesResponse,
  SystemStatusResponse,
  SuperAdminSettingsResponse,
  GetOrganizationAdminsArgs,
  OrganizationAdminsResponse,
  OrganizationAdminResponse,
} from './super-admin.interfaces';
import { Organization } from '@/models/Organization';

export const superAdminQueries = {
  getSuperAdminDashboardStats: async (
    _: unknown,
    __: unknown,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ): Promise<DashboardStatsResponse> => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authorization('Not authorized to access super admin dashboard');
      }

      const [
        totalInstitutes,
        totalStudents,
        totalDepartments,
        activeAdmins,
      ] = await Promise.all([
        Institute.countDocuments({ isActive: true }),
        Institute.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: null, total: { $sum: '$studentsCount' } } },
        ]).then(result => result[0]?.total || 0),
        Institute.aggregate([
          { $match: { isActive: true } },
          { $project: { departmentCount: { $size: '$departments' } } },
          { $group: { _id: null, total: { $sum: '$departmentCount' } } },
        ]).then(result => result[0]?.total || 0),
        OrganizationUserRole.countDocuments({ isActive: true }),
      ]);

      return {
        success: true,
        message: 'Dashboard stats fetched successfully',
        stats: {
          totalInstitutes,
          totalStudents,
          totalDepartments,
          activeAdmins,
        }
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch super admin dashboard stats', {
        operation: 'getSuperAdminDashboardStats',
        error,
      });
    }
  },

  getRecentActivities: async (
    _: unknown,
    { limit = 10 }: GetRecentActivitiesArgs,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ): Promise<RecentActivitiesResponse> => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authorization('Not authorized to access super admin activities');
      }

      // For now, we'll combine recent activities from different sources
      // In a real implementation, you might want to have a dedicated ActivityLog collection
      const [newOrganizations, newAdmins] = await Promise.all([
        Organization.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .then(organizations => organizations.map(organization => ({
            id: organization.organizationId,
            type: 'organization_added',
            message: `New organization "${organization.name}" was added`,
            time: organization.createdAt.toISOString(),
            instituteId: organization.organizationId,
          }))),
        OrganizationUserRole.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .then(roles => roles.map(role => ({
            id: role.assignmentId,
            type: 'admin_assigned',
            message: `New admin assigned to organization`,
            time: role.createdAt.toISOString(),
            instituteId: role.organizationId,
            userId: role.userId,
          }))),
      ]);

      const allActivities = [...newOrganizations, ...newAdmins]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, limit);

      return {
        success: true,
        message: 'Recent activities fetched successfully',
        activities: allActivities
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch recent activities', {
        operation: 'getRecentActivities',
        error,
      });
    }
  },

  getSystemStatus: async (
    _: unknown,
    __: unknown,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ): Promise<SystemStatusResponse> => {
    try {
      if (!isAuthenticated || !isSuperAdmin) {
        throw createError.authorization('Not authorized to access system status');
      }

      // In a real implementation, you would get this from your monitoring system
      // For now, we'll return mock data
      return {
        success: true,
        message: 'System status fetched successfully',
        status: {
          status: 'operational',
          load: 0.25, // 25% system load
          lastUpdated: new Date().toISOString(),
        }
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch system status', {
        operation: 'getSystemStatus',
        error,
      });
    }
  },

  getOrganizationAdmins: async (
    _: unknown,
    { page = 1, limit = 10, search }: GetOrganizationAdminsArgs,
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ): Promise<OrganizationAdminsResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can view all organization admins');
      }

      const query: any = {};
      if (search) {
        query['userId'] = { $regex: search, $options: 'i' };
      }

      const total = await OrganizationUserRole.countDocuments(query);
      const admins = await OrganizationUserRole.find(query)
        .populate('roleId')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Organization admins fetched successfully',
        admins,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organization admins', {
        operation: 'getAdmins',
        entityType: 'OrganizationUserRole',
        error,
      });
    }
  },

  getSuperAdminSettings: async (
    _: unknown,
    __: unknown,
    { isAuthenticated, isSuperAdmin, user }: GraphQLContext
  ): Promise<SuperAdminSettingsResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can access these settings');
      }

      // Get settings from user document or a separate settings collection
      const settings = await User.findById(user?.id).select('settings');

      if (!settings) {
        throw createError.notFound('Settings not found');
      }

      if (!settings.settings) {
        throw createError.notFound('Settings not found');
      }

      const { twoFactorCode, ...userSettings } = settings.settings;

      return {
        success: true,
        message: 'Settings fetched successfully',
        settings: userSettings
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch super admin settings', {
        operation: 'getSuperAdminSettings',
        error,
      });
    }
  },

  getOrganizationAdmin: async (
    _: unknown,
    { adminId }: { adminId: string },
    { isAuthenticated, isSuperAdmin }: GraphQLContext
  ): Promise<OrganizationAdminResponse>=> {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      if (!isSuperAdmin) {
        throw createError.authorization('Only super admin can view organization admin details');
      }

      const admin = await OrganizationUserRole.findOne({ assignmentId: adminId }).populate('roleId');
      if (!admin) {
        throw createError.notFound(`Admin with ID ${adminId} not found`, {
          entityType: 'OrganizationUserRole',
          entityId: adminId,
        });
      }

      return {
        success: true,
        message: 'Organization admin fetched successfully',
        admin,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch organization admin', {
        operation: 'getAdmin',
        entityType: 'OrganizationUserRole',
        adminId,
        error,
      });
    }
  },
};
