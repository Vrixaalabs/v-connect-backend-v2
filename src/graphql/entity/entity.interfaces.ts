// Entity Types
export enum EntityType {
  CLUB = 'CLUB',
  DEPARTMENT = 'DEPARTMENT',
  COMMITTEE = 'COMMITTEE',
  TEAM = 'TEAM',
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum MemberStatus {
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
  totalMembers: number;
  totalPosts: number;
  totalEvents: number;
  lastActivityAt?: Date;
}

export interface IEntityMember {
  userId: string;
  role: string;
  joinedAt: Date;
  status: MemberStatus;
}

export interface IEntity {
  entityId: string;
  name: string;
  type: EntityType;
  code?: string;
  description?: string;
  organizationId?: string;
  parentEntityId?: string;
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

export interface IAddEntityMemberInput {
  entityId: string;
  userId: string;
  role: string;
}

export interface IUpdateEntityMemberInput {
  role?: string;
  status?: MemberStatus;
}

export interface ICreateEntityMemberInput {
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

export interface IGetEntityMembersInput {
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
  totalMembers: number;
  activeMembers: number;
  averageMembersPerEntity: number;
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

export interface IEntityMemberResponse extends IBaseResponse {
  member?: IEntityMember;
}

export interface IEntityMembersResponse extends IBaseResponse {
  members: IEntityMember[];
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

export interface IAddEntityMemberMutationInput {
  input: IAddEntityMemberInput;
}

export interface IUpdateEntityMemberMutationInput {
  id: string;
  input: IUpdateEntityMemberInput;
}

export interface IRemoveEntityMemberMutationInput {
  id: string;
}

export interface ICreateEntityMemberMutationInput {
  input: ICreateEntityMemberInput;
}

export interface IArchiveEntityMutationInput {
  id: string;
}
