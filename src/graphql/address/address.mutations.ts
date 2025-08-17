import { Context, IAddress } from '@/types/types';
import { createError } from '../../middleware/errorHandler';
import { Address } from '../../models/Address';
import { BaseError } from '../../types/errors/base.error';
import { CreateAddressResp, UpdateAddressResp } from './address.interfaces';

export const addressMutations = {
  createAddress: async (
    _: unknown,
    { input }: { input: Partial<IAddress> },
    { isAuthenticated }: Context
  ): Promise<CreateAddressResp> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      const address = await Address.create(input);
      return {
        success: true,
        message: 'Address created successfully',
        address,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create address', {
        operation: 'create',
        entityType: 'Address',
      });
    }
  },
  updateAddress: async (
    _: unknown,
    { addressId, input }: { addressId: string; input: Partial<IAddress> },
    { isAuthenticated }: Context
  ): Promise<UpdateAddressResp> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      const address = await Address.findOneAndUpdate({ addressId }, input, {
        new: true,
      });
      if (!address) {
        throw createError.notFound(
          `Address with addressId: ${addressId} not found`
        );
      }
      return {
        success: true,
        message: 'Address updated successfully',
        address,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update address', {
        operation: 'update',
        entityType: 'Address',
      });
    }
  },
  deleteAddress: async (
    _: unknown,
    { addressId }: { addressId: string },
    { isAuthenticated }: Context
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      const address = await Address.findOneAndDelete({ addressId });
      if (!address) {
        throw createError.notFound(
          `Address with addressId: ${addressId} not found`
        );
      }
      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete address', {
        operation: 'delete',
        entityType: 'Address',
      });
    }
  },
};
