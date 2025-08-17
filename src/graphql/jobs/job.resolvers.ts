import { IAddress, IJob } from '@/types/types';
import { Address } from '../../models/Address';

export const jobResolvers = {
  address: async (parent: IJob): Promise<IAddress | null> => {
    if (!parent.addressId) {
      return null;
    }
    return await Address.findOne({ addressId: parent.addressId }).lean();
  },
};
