import { createError } from '../../middleware/errorHandler';
import { Address } from '../../models/Address';
import { Branch as BranchModel } from '../../models/Branch';
import { Franchisee } from '../../models/Franchisee';
import { UserFranchiseeRole } from '../../models/UserFranchiseeRole';
import { GraphQLError } from '../../types/error.types';
import { GraphQLContext } from '../context';
import {
  BranchResponse,
  CreateBranchInput,
  DeleteBranchResponse,
  UpdateBranchInput,
} from './branch.interfaces';

export const branchMutations = {
  createBranch: async (
    _: unknown,
    { input }: { input: CreateBranchInput },
    { user }: GraphQLContext
  ): Promise<BranchResponse> => {
    try {
      if (!user) {
        throw createError.authentication('Not authenticated');
      }

      // Get user's role for the franchisee
      const userFranchiseeRole = await UserFranchiseeRole.findOne({
        userId: user.id,
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
        status: 'active',
      }).populate({
        path: 'roleId',
        model: 'Role',
        select: 'roleId name permissions',
      });

      if (!userFranchiseeRole) {
        throw createError.authentication(
          'User is not associated with this franchisee'
        );
      }

      // Check if user has admin role
      // const role = userFranchiseeRole.roleId as any;
      // if (role.name !== 'Franchisee Admin') {
      //   throw createError.authentication(
      //     'Not authorized. Only Franchisee Admin can create branches.'
      //   );
      // }

      const { address, ...branchData } = input;

      // Create new address and then a branch
      const newAddress = await Address.create({
        addressLine: address.addressLine,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country,
        map: {
          latitude: address.map.latitude,
          longitude: address.map.longitude,
        },
        isPrimary: address.isPrimary,
        type: address.type,
      });
      const newAddressId = newAddress.addressId;

      // First verify the franchisee exists
      const franchisee = await Franchisee.findOne({
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
      });
      if (!franchisee) {
        throw createError.notFound('Franchisee not found');
      }

      const branch = new BranchModel({
        ...branchData,
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
        addressId: newAddressId,
      });

      await branch.save();

      return {
        success: true,
        message: 'Branch created successfully',
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
  updateBranch: async (
    _: unknown,
    { branchId, input }: { branchId: string; input: UpdateBranchInput },
    context: GraphQLContext
  ): Promise<BranchResponse> => {
    try {
      // Verify user is authenticated and is a Franchisee Admin
      if (!context.user) {
        throw createError.authentication('Not authenticated');
      }

      // Get user's role for the franchisee
      const userFranchiseeRole = await UserFranchiseeRole.findOne({
        userId: context.user.id,
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
        status: 'active',
      }).populate({
        path: 'roleId',
        model: 'Role',
        select: 'roleId name permissions',
      });

      if (!userFranchiseeRole) {
        throw createError.authentication(
          'User is not associated with this franchisee'
        );
      }

      // Check if user has admin role
      // const role = userFranchiseeRole.roleId as any;
      // if (role.name !== 'Franchisee Admin') {
      //   throw createError.authentication(
      //     'Not authorized. Only Franchisee Admin can update branches.'
      //   );
      // }

      const { address, ...branchData } = input;

      const existingBranch = await BranchModel.findOne({
        branchId,
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
      });

      if (!existingBranch) {
        throw createError.notFound('Branch not found');
      }

      if (address && Object.keys(address).length > 0) {
        await Address.findOneAndUpdate(
          { addressId: existingBranch.addressId },
          { $set: address },
          { new: true }
        );
      }

      const updatedBranch = await BranchModel.findOneAndUpdate(
        {
          branchId,
          franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
        },
        { $set: branchData },
        { new: true }
      );

      if (!updatedBranch) {
        throw createError.notFound('Branch not found');
      }

      return {
        success: true,
        message: 'Branch updated successfully',
        branch: updatedBranch,
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
  deleteBranch: async (
    _: unknown,
    { branchId }: { branchId: string },
    context: GraphQLContext
  ): Promise<DeleteBranchResponse> => {
    try {
      // Verify user is authenticated and is a Franchisee Admin
      if (!context.user) {
        throw createError.authentication('Not authenticated');
      }

      // Get user's role for the franchisee
      const userFranchiseeRole = await UserFranchiseeRole.findOne({
        userId: context.user.id,
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
        status: 'active',
      }).populate({
        path: 'roleId',
        model: 'Role',
        select: 'roleId name permissions',
      });

      if (!userFranchiseeRole) {
        throw createError.authentication(
          'User is not associated with this franchisee'
        );
      }

      // Check if user has admin role
      // const role = userFranchiseeRole.roleId as any;
      // if (role.name !== 'Franchisee Admin') {
      //   throw createError.authentication(
      //     'Not authorized. Only Franchisee Admin can delete branches.'
      //   );
      // }

      // Find and delete branch
      const branch = await BranchModel.findOne({
        branchId,
        // franchiseeId: primaryFranchisee.franchisee.franchiseeId,
        franchiseeId: '7cf30a59-c672-4cc7-ac4d-e379d155e761',
      });

      if (!branch) {
        throw createError.notFound('Branch not found');
      }

      if (branch.addressId) {
        await Address.findOneAndDelete({ addressId: branch.addressId });
      }

      await branch.deleteOne();

      return {
        success: true,
        message: 'Branch and associated address deleted successfully',
      };
    } catch (error: unknown) {
      const err = error as GraphQLError;
      return {
        success: false,
        message: err.message,
      };
    }
  },
};
