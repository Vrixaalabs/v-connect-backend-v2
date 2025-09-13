import { IEntityRequestMetadata } from '@/models/EntityRequest';

// Entity Types
export enum EntityType {
  INSTITUTE = 'INSTITUTE',
  SCHOOL = 'SCHOOL',
  DEPARTMENT = 'DEPARTMENT',
  CLUB = 'CLUB',
  TEAM = 'TEAM',
  OTHER = 'OTHER',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EntityVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  ORGANIZATION = 'ORGANIZATION',
}

// Base Interfaces
export interface IEntitySettings {
  allowMembershipRequests: boolean;
  requireApproval: boolean;
  visibility: EntityVisibility;
  allowPosts: boolean;
  allowEvents: boolean;
  allowAnnouncements: boolean;
}

export interface IEntityMetadata {
  totalUsers: number;
  totalPosts: number;
  totalEvents: number;
  lastActivityAt?: Date;
}

export interface IEntityUserRole {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  role: {
    roleId: string;
    name: string;
    permissions: string[];
  };
  joinedAt: Date;
  status: UserStatus;
}

export interface IEntity {
  entityId: string;
  entityChatId?: string;
  name: string;
  type: EntityType;
  code?: string;
  description?: string;
  organizationId?: string;
  parentEntityId?: string;
  parentEntityName?: string;
  status: EntityStatus;
  logo?: string;
  banner?: string;
  settings: IEntitySettings;
  metadata?: IEntityMetadata;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Input Interfaces
export interface IEntitySettingsInput {
  allowMembershipRequests?: boolean;
  requireApproval?: boolean;
  visibility?: EntityVisibility;
  allowPosts?: boolean;
  allowEvents?: boolean;
  allowAnnouncements?: boolean;
}

export interface ICreateEntityInput {
  name: string;
  type: EntityType;
  description?: string;
  organizationId?: string;
  code?: string;
  parentEntityId?: string;
  logo?: string;
  banner?: string;
  settings?: IEntitySettingsInput;
}

export interface IUpdateEntityInput {
  name?: string;
  code?: string;
  description?: string;
  parentEntityId?: string;
  status?: EntityStatus;
  logo?: string;
  banner?: string;
  settings?: IEntitySettingsInput;
}

export interface IAddEntityUserRoleInput {
  entityId: string;
  userId: string;
  role: string;
}

export interface IUpdateEntityUserRoleInput {
  role?: string;
  status?: UserStatus;
}

export interface ICreateEntityUserRoleInput {
  userId: string;
  role: string;
}

// Query Input Interfaces
export interface IGetEntitiesInput {
  organizationId?: string;
  type?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface IGetEntityInput {
  entityId: string;
}

export interface IGetEntityUserRolesInput {
  entityId: string;
  status?: string;
  role?: string;
  page: number;
  limit: number;
}

export interface IGetEntityStatsInput {
  organizationId?: string;
}

// Response Interfaces
export interface IEntityTypeCount {
  type: EntityType;
  count: number;
}

export interface IEntityStatusCount {
  status: EntityStatus;
  count: number;
}

export interface IEntityStats {
  totalEntities: number;
  entitiesByType: IEntityTypeCount[];
  entitiesByStatus: IEntityStatusCount[];
  totalUsers: number;
  activeUsers: number;
  averageUsersPerEntity: number;
}

export interface IBaseResponse {
  success: boolean;
  message: string;
}

export interface IEntityResponse extends IBaseResponse {
  entity?: IEntity;
}

export interface IEntitiesResponse extends IBaseResponse {
  entities: IEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IEntityUserRoleResponse extends IBaseResponse {
  user?: IEntityUserRole;
}

export interface IEntityUserRolesResponse extends IBaseResponse {
  users: IEntityUserRole[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IEntityStatsResponse extends IBaseResponse {
  stats: IEntityStats;
}

// Mutation Input Interfaces
export interface ICreateEntityMutationInput {
  input: ICreateEntityInput;
}

export interface IUpdateEntityMutationInput {
  id: string;
  input: IUpdateEntityInput;
}

export interface IDeleteEntityMutationInput {
  id: string;
}

export interface IAddEntityUserRoleMutationInput {
  input: IAddEntityUserRoleInput;
}

export interface IUpdateEntityUserRoleMutationInput {
  id: string;
  input: IUpdateEntityUserRoleInput;
}

export interface IRemoveEntityUserRoleMutationInput {
  id: string;
}

export interface ICreateEntityUserRoleMutationInput {
  input: ICreateEntityUserRoleInput;
}

export interface IArchiveEntityMutationInput {
  id: string;
}

export interface IEntityRequest {
  entityRequestId: string;
  entityId: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEntityRequestInput {
  entityId: string;
  metadata?: IEntityRequestMetadata;
}
export interface ICreateEntityRequestMutationInput {
  input: ICreateEntityRequestInput;
}

export interface IEntityRequestResponse extends IBaseResponse {
  entityRequest?: IEntityRequest;
}

export interface IGetEntityRequestsInput {
  entityId: string;
}

export interface IGetEntityRequestsResponse extends IBaseResponse {
  entityRequests?: IEntityRequest[];
}

export interface IAcceptEntityJoinRequestMutationInput {
  requestId: string;
}

export interface IRejectEntityJoinRequestMutationInput {
  requestId: string;
}
