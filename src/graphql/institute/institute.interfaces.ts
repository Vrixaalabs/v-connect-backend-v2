import { IInstitute } from '../../models/Institute';
import { IInstituteRole } from '../../models/InstituteRole';
import { IInstituteJoinRequest } from '../../models/InstituteJoinRequest';

// Base Response Types
interface BaseResponse {
  success: boolean;
  message: string;
}

// Institute Response Types
export interface InstituteResponse extends BaseResponse {
  institute?: IInstitute;
}

export interface InstitutesResponse extends BaseResponse {
  institutes: IInstitute[];
  total: number;
  page: number;
  limit: number;
}

// Institute Role Response Types
export interface InstituteRoleResponse extends BaseResponse {
  role?: IInstituteRole;
}

export interface InstituteRolesResponse extends BaseResponse {
  roles: IInstituteRole[];
}

// Join Request Response Types
export interface JoinRequestResponse extends BaseResponse {
  request?: IInstituteJoinRequest;
}

export interface JoinRequestsResponse extends BaseResponse {
  requests: IInstituteJoinRequest[];
  total: number;
  page: number;
  limit: number;
}

// Query Request Types
export interface GetInstituteByIdArgs {
  instituteId: string;
}

export interface GetInstituteBySlugArgs {
  slug: string;
}

export interface GetInstituteRolesArgs {
  instituteId: string;
}

export interface GetInstituteRoleArgs {
  roleId: string;
}

export interface SearchInstitutesArgs {
  filter?: InstituteFilterInput;
  page?: number;
  limit?: number;
}

// Mutation Request Types
export interface FollowInstituteArgs {
  instituteId: string;
}

export interface UnfollowInstituteArgs {
  instituteId: string;
}

export interface CreateInstituteRoleArgs {
  instituteId: string;
  input: CreateInstituteRoleInput;
}

export interface UpdateInstituteRoleArgs {
  roleId: string;
  input: UpdateInstituteRoleInput;
}

export interface DeleteInstituteRoleArgs {
  roleId: string;
}

export interface AssignInstituteRoleArgs {
  instituteId: string;
  userId: string;
  roleId: string;
  departmentId?: string;
}

export interface RemoveInstituteRoleArgs {
  instituteId: string;
  userId: string;
}

export interface CreateJoinRequestArgs {
  input: CreateJoinRequestInput;
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
