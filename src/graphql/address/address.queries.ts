import { Context } from '@/types/types';
import { createError } from '../../middleware/errorHandler';
import { Address } from '../../models/Address';
import { BaseError } from '../../types/errors/base.error';
import { GetAddressByIdResult } from './address.interfaces';

export const addressQueries = {
  getAddressById: async (
    _: unknown,
    { addressId }: { addressId: string },
    { isAuthenticated }: Context
  ): Promise<GetAddressByIdResult> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      const address = await Address.findOne({ addressId });
      if (!address) {
        throw createError.notFound(
          `Address with addressId: ${addressId} not found`
        );
      }
      return {
        success: true,
        message: 'Address fetched successfully',
        address,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch address', {
        operation: 'get',
        entityType: 'Address',
      });
    }
  },
};
