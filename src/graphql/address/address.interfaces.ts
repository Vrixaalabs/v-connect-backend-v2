import { IAddress } from '../../types/types';

export interface GetAddressByIdResult {
  success: boolean;
  message: string;
  address: IAddress;
}

export interface CreateAddressResp {
  success: boolean;
  message: string;
  address: IAddress;
}

export interface UpdateAddressResp {
  success: boolean;
  message: string;
  address: IAddress;
}
