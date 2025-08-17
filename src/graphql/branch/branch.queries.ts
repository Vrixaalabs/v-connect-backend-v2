import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { FilterQuery } from 'mongoose';
import { Branch as BranchModel } from '../../models/Branch';
import { User } from '../../models/User';
import { GraphQLError } from '../../types/error.types';
import { GraphQLContext } from '../context';
import {
  BranchDocument,
  BranchListResponse,
  BranchResponse,
  GetBranchArgs,
  ListBranchesArgs,
} from './branch.interfaces';

export const branchQueries = {
  getBranchById: async (
    _: unknown,
    { branchId }: GetBranchArgs,
    context: GraphQLContext
  ): Promise<BranchResponse> => {
    try {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const primaryFranchisee = await User.findOne({
        userId: context.user.id,
      }).then(user => user?.getPrimaryFranchisee());
      if (!primaryFranchisee) {
        throw new AuthenticationError(
          'User is not associated with any franchisee'
        );
      }

      const isAdmin = await User.findOne({ userId: context.user.id }).then(
        user =>
          user?.hasRole(
            primaryFranchisee.franchisee.franchiseeId,
            'Franchisee Admin'
          )
      );

      if (!isAdmin) {
        throw new AuthenticationError(
          'Not authorized. Only Franchisee Admin can view branches.'
        );
      }

      // Find branch
      const branch = await BranchModel.findOne({
        branchId,
        franchiseeId: primaryFranchisee.franchisee.franchiseeId,
      });

      if (!branch) {
        throw new UserInputError('Branch not found');
      }

      return {
        success: true,
        message: 'Branch retrieved successfully',
        branch,
      };
    } catch (error: unknown) {
      const err = error as GraphQLError;
      return {
        success: false,
        message: err.message,
        branch: null,
      };
    }
  },
  listBranchesByFranchisee: async (
    _: unknown,
    {
      page = 1,
      limit = 10,
      name,
      code,
      type,
      status,
      phone,
      email,
      managerName,
      timezone,
    }: ListBranchesArgs,
    context: GraphQLContext
  ): Promise<BranchListResponse> => {
    try {
      // Verify user is authenticated and is a Franchisee Admin
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Get user's primary franchisee and role
      const primaryFranchisee = await User.findOne({
        userId: context.user.id,
      }).then(user => user?.getPrimaryFranchisee());
      if (!primaryFranchisee) {
        throw new AuthenticationError(
          'User is not associated with any franchisee'
        );
      }

      const isAdmin = await User.findOne({ userId: context.user.id }).then(
        user =>
          user?.hasRole(
            primaryFranchisee.franchisee.franchiseeId,
            'Franchisee Admin'
          )
      );

      if (!isAdmin) {
        throw new AuthenticationError(
          'Not authorized. Only Franchisee Admin can list branches.'
        );
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      const franchiseeId = primaryFranchisee.franchisee.franchiseeId;

      const filters: FilterQuery<BranchDocument> = { franchiseeId };
      if (name) filters.name = { $regex: name, $options: 'i' };
      if (code) filters.code = { $regex: code, $options: 'i' };
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (phone) filters['contact.phone'] = { $regex: phone, $options: 'i' };
      if (email) filters['contact.email'] = { $regex: email, $options: 'i' };
      if (managerName)
        filters['contact.managerName'] = { $regex: managerName, $options: 'i' };
      if (timezone) filters['settings.timezone'] = timezone;

      const totalCount = await BranchModel.countDocuments(filters);
      const branches = await BranchModel.find(filters)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Branches retrieved successfully',
        branches,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: unknown) {
      const err = error as GraphQLError;
      return {
        success: false,
        message: err.message,
        branches: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
      };
    }
  },
};
