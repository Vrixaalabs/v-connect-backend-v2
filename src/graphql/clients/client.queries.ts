import {
  Context,
  GetAllClientsStatsArgs,
  GetAllClientsStatsResult,
  GetClientByIdArgs,
  GetClientByIdResult,
  IClientByBranchArgs,
  IClientByBranchResponse,
  ListClientsArgs,
  ListClientsResult,
} from '@/graphql/clients/client.interfaces';
import { FilterQuery } from 'mongoose';
import { createError } from '../../middleware/errorHandler';
import { Client } from '../../models/Client';
import { Job } from '../../models/Job';
import { BaseError } from '../../types/errors/base.error';
import { IClient } from '../../types/types';

export const clientQueries = {
  listClients: async (
    _: unknown,
    args: ListClientsArgs,
    { isAuthenticated }: Context
  ): Promise<ListClientsResult> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      if (!isAuthenticated)
        throw createError.authentication('Not authenticated');

      const page = args.page || 1;
      const limit = args.limit || 10;
      const skip = (page - 1) * limit;

      const [clients, total] = await Promise.all([
        Client.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        Client.countDocuments(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Clients fetched successfully.',
        clients,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to list clients', {
        operation: 'list',
        entityType: 'Client',
      });
    }
  },
  listClientsByFranchisee: async (
    _: unknown,
    args: ListClientsArgs,
    { isAuthenticated }: Context
  ): Promise<ListClientsResult> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');

    try {
      const {
        page = 1,
        limit = 10,
        search,
        franchiseeId,
        firstName,
        lastName,
        email,
        phone,
        companyName,
      } = args;

      const filters: FilterQuery<IClient> = {
        franchiseeId,
      };

      if (search) {
        filters.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (firstName) filters.firstName = { $regex: firstName, $options: 'i' };
      if (lastName) filters.lastName = { $regex: lastName, $options: 'i' };
      if (email) filters.email = { $regex: email, $options: 'i' };
      if (phone) filters.phone = phone;
      if (companyName)
        filters.companyName = { $regex: companyName, $options: 'i' };

      const skip = (page - 1) * limit;
      const [clients, total] = await Promise.all([
        Client.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Client.countDocuments(filters),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Clients fetched successfully.',
        clients,
        total,
        page,
        totalPages,
        limit,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to list clients', {
        operation: 'list',
        entityType: 'Client',
      });
    }
  },
  getClientById: async (
    _: unknown,
    args: GetClientByIdArgs,
    { isAuthenticated }: Context
  ): Promise<GetClientByIdResult> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      const client = await Client.findOne({ clientId: args.clientId });
      if (!client) {
        return {
          success: false,
          message: 'Client not found.',
          client: null,
        };
      }

      return {
        success: true,
        message: 'Client fetched successfully.',
        client,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get client by ID', {
        operation: 'get',
        entityType: 'Client',
      });
    }
  },
  getAllClientsStats: async (
    _: unknown,
    args: GetAllClientsStatsArgs,
    { isAuthenticated }: Context
  ): Promise<GetAllClientsStatsResult> => {
    try {
      if (!isAuthenticated)
        throw createError.authentication('Not authenticated');

      // Get total number of clients
      const totalClients = await Client.countDocuments();

      // Get counts for billing and tax exempt clients
      const [clientsWithBilling, taxExemptClients] = await Promise.all([
        Client.countDocuments({ allowBilling: true }),
        Client.countDocuments({ taxExempt: true }),
      ]);

      // Get clients by ad source
      const clientsBySource = await Client.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$adSource', 'Unknown'] },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            source: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Get clients by region
      const clientsByRegion = await Client.aggregate([
        { $unwind: '$addresses' },
        {
          $group: {
            _id: '$addresses.region',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            region: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Calculate active clients (those with jobs in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeClientsCount = await Job.distinct('clientId', {
        createdAt: { $gte: thirtyDaysAgo },
      }).then(clientIds => clientIds.length);

      const stats = {
        totalClients,
        activeClients: activeClientsCount,
        clientsWithBilling,
        taxExemptClients,
        clientsBySource,
        clientsByRegion,
      };

      return {
        success: true,
        message: 'All clients stats fetched successfully.',
        stats,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get all clients stats', {
        operation: 'get',
        entityType: 'Client',
      });
    }
  },
  getClientsByBranch: async (
    _: unknown,
    args: IClientByBranchArgs,
    { isAuthenticated }: Context
  ): Promise<IClientByBranchResponse> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');

    const { branchId, filters = {}, page = 1, limit = 10 } = args;
    try {
      const query: Record<string, unknown> = { branchId };
      if (filters.firstName)
        query.firstName = { $regex: filters.firstName, $options: 'i' };
      if (filters.lastName)
        query.lastName = { $regex: filters.lastName, $options: 'i' };
      if (filters.email) query.email = { $regex: filters.email, $options: 'i' };
      if (filters.phone) query.phone = filters.phone;
      if (filters.altPhone) query.altPhone = filters.altPhone;
      if (filters.companyName)
        query.companyName = { $regex: filters.companyName, $options: 'i' };
      if (filters.adSource)
        query.adSource = { $regex: filters.adSource, $options: 'i' };
      if (filters.allowBilling !== undefined)
        query.allowBilling = filters.allowBilling;
      if (filters.taxExempt !== undefined) query.taxExempt = filters.taxExempt;

      const skip = (page - 1) * limit;
      const [clients, total] = await Promise.all([
        Client.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Client.countDocuments(query),
      ]);

      return {
        success: true,
        message: 'Clients fetched successfully.',
        clients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch client by branch', {
        operation: 'get',
        entityType: 'Client',
      });
    }
  },
};
