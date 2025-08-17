import { IAddress, IBranch } from '@/types/types';
import { Address } from '../../models/Address';

export const branchResolvers = {
  address: async (parent: IBranch): Promise<IAddress | null> => {
    if (!parent.addressId) {
      return null;
    }
    return await Address.findOne({ addressId: parent.addressId }).lean();
  },
};
