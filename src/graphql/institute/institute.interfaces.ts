import { IInstitute } from '../../models/Institute';
import { IInstituteRole } from '../../models/InstituteRole';
import { IInstituteJoinRequest } from '../../models/InstituteJoinRequest';

export interface InstituteResponse {
  success: boolean;
  message: string;
  institute?: IInstitute;
}

export interface InstitutesResponse {
  success: boolean;
  message: string;
  institutes: IInstitute[];
  total: number;
  page: number;
  limit: number;
}

export interface InstituteRoleResponse {
  success: boolean;
  message: string;
  role?: IInstituteRole;
}

export interface InstituteRolesResponse {
  success: boolean;
  message: string;
  roles: IInstituteRole[];
}

export interface JoinRequestResponse {
  success: boolean;
  message: string;
  request?: IInstituteJoinRequest;
}

export interface JoinRequestsResponse {
  success: boolean;
  message: string;
  requests: IInstituteJoinRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateInstituteInput {
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  website?: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  departments: {
    name: string;
    code: string;
    description?: string;
  }[];
}

export interface UpdateInstituteInput {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  departments?: {
    name: string;
    code: string;
    description?: string;
  }[];
}

export interface CreateInstituteRoleInput {
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface UpdateInstituteRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
}

export interface CreateJoinRequestInput {
  instituteId: string;
  fullName: string;
  email: string;
  rollNumber: string;
  departmentId: string;
  batch: string;
}

export interface InstituteFilterInput {
  name?: string;
  city?: string;
  state?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}
