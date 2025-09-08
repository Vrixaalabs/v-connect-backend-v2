import { IOrganization } from '../../models/Organization';
import { IOrganizationRole } from '../../models/OrganizationRole';
import { OrganizationJoinRequest } from '../../models/OrganizationJoinRequest';

// Base Response Types
interface BaseResponse {
  success: boolean;
  message: string;
}

// Institute Response Types
export interface OrganizationResponse extends BaseResponse {
  organization?: IOrganization;
}

export interface OrganizationsResponse extends BaseResponse {
  organizations: IOrganization[];
  total: number;
  page: number;
  limit: number;
}

// Institute Role Response Types
export interface OrganizationRoleResponse extends BaseResponse {
  role?: IOrganizationRole;
}

export interface OrganizationRolesResponse extends BaseResponse {
  roles: IOrganizationRole[];
}

// Join Request Response Types
export interface JoinRequestResponse extends BaseResponse {
  request?: OrganizationJoinRequest;
}

export interface JoinRequestsResponse extends BaseResponse {
  requests: OrganizationJoinRequest[];
  total: number;
  page: number;
  limit: number;
}

// Query Request Types
export interface GetOrganizationByIdArgs {
  organizationId: string;
}

export interface GetOrganizationBySlugArgs {
  slug: string;
}

export interface GetOrganizationRolesArgs {
  organizationId: string;
}

export interface GetOrganizationRoleArgs {
  roleId: string;
}

export interface SearchOrganizationsArgs {
  filter?: OrganizationFilterInput;
  page?: number;
  limit?: number;
}

// Mutation Request Types
export interface FollowOrganizationArgs {
  organizationId: string;
}

export interface UnfollowOrganizationArgs {
  organizationId: string;
}

export interface CreateOrganizationRoleArgs {
  organizationId: string;
  input: CreateOrganizationRoleInput;
}

export interface UpdateOrganizationRoleArgs {
  roleId: string;
  input: UpdateOrganizationRoleInput;
}

export interface DeleteOrganizationRoleArgs {
  roleId: string;
}

export interface AssignOrganizationRoleArgs {
  organizationId: string;
  userId: string;
  roleId: string;
  departmentId?: string;
}

export interface RemoveOrganizationRoleArgs {
  organizationId: string;
  userId: string;
}

export interface CreateJoinRequestArgs {
  input: CreateJoinRequestInput;
}

export interface CreateOrganizationInput {
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

export interface UpdateOrganizationInput {
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

export interface CreateOrganizationRoleInput {
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface UpdateOrganizationRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
}

export interface CreateJoinRequestInput {
  organizationId: string;
  fullName: string;
  email: string;
  rollNumber: string;
  departmentId: string;
  batch: string;
}

export interface OrganizationFilterInput {
  name?: string;
  city?: string;
  state?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}
