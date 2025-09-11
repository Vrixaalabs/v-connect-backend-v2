export const entityTypes = `#graphql
  type Entity {
    entityId: String!
    entityChatId: String
    name: String!
    type: EntityType!
    code: String
    description: String
    organizationId: String
    parentEntityId: String
    parentEntityName: String
    status: EntityStatus!
    logo: String
    banner: String
    settings: EntitySettings!
    metadata: EntityMetadata
    createdBy: String!
    updatedBy: String
    createdAt: String!
    updatedAt: String!
  }

  type Role {
    roleId: String!
    name: String!
    permissions: [String!]!
  }

  type EntityUserRole {
    user: User!
    role: Role!
    joinedAt: String!
    status: UserStatus!
  }

  type EntitySettings {
    allowMembershipRequests: Boolean!
    requireApproval: Boolean!
    visibility: EntityVisibility!
    allowPosts: Boolean!
    allowEvents: Boolean!
    allowAnnouncements: Boolean!
  }

  type EntityMetadata {
    totalMembers: Int!
    totalPosts: Int!
    totalEvents: Int!
    lastActivityAt: String
  }

  enum EntityType {
    INSTITUTE
    SCHOOL
    DEPARTMENT
    CLUB
    TEAM
    OTHER
  }

  enum EntityStatus {
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
  }

  enum EntityVisibility {
    PUBLIC
    PRIVATE
    ORGANIZATION
  }

  input CreateEntityInput {
    name: String!
    type: EntityType!
    description: String
    organizationId: ID
    code: String
    parentEntityId: ID
    logo: String
    banner: String
    settings: EntitySettingsInput
  }

  input UpdateEntityInput {
    name: String
    description: String
    parentEntityId: ID
    status: EntityStatus
    logo: String
    banner: String
    settings: EntitySettingsInput
  }

  input EntitySettingsInput {
    allowMembershipRequests: Boolean
    requireApproval: Boolean
    visibility: EntityVisibility
    allowPosts: Boolean
    allowEvents: Boolean
    allowAnnouncements: Boolean
  }

  input AddEntityUserRoleInput {
    userId: String!
    role: String!
  }

  input UpdateEntityUserRoleInput {
    role: String
    status: UserStatus
  }

  type EntityResponse {
    success: Boolean!
    message: String!
    entity: Entity
  }

  type EntitiesResponse {
    success: Boolean!
    message: String!
    entities: [Entity!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type EntityUserRoleResponse {
    success: Boolean!
    message: String!
    user: EntityUserRole
  }

  type EntityUserRolesResponse {
    success: Boolean!
    message: String!
    users: [EntityUserRole!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type EntityStats {
    totalEntities: Int!
    entitiesByType: [EntityTypeCount!]!
    entitiesByStatus: [EntityStatusCount!]!
    totalUsers: Int!
    activeUsers: Int!
    averageUsersPerEntity: Float!
  }

  input CreateEntityUserRoleInput {
    userId: String!
    role: String!
  }

  type EntityTypeCount {
    type: EntityType!
    count: Int!
  }

  type EntityStatusCount {
    status: EntityStatus!
    count: Int!
  }

  type EntityStatsResponse {
    success: Boolean!
    message: String!
    stats: EntityStats!
  }

  type EntityRequestMetadata {
    fullName: String!
    email: String!
    rollNumber: String!
    type: String!
    department: String!
    batch: String!
    message: String
  }

  type EntityRequest {
    entityRequestId: String!
    entityId: String!
    userId: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    metadata: EntityRequestMetadata
  }

  input EntityRequestMetadataInput {
    fullName: String!
    email: String!
    rollNumber: String!
    type: String!
    department: String!
    batch: String!
    message: String
  }

  input CreateEntityRequestInput {
    entityId: String!
    metadata: EntityRequestMetadataInput
  }

  input GetEntityRequestsInput {
    entityId: String!
  }
  

  type EntityRequestsResponse {
    success: Boolean!
    message: String!
    entityRequests: [EntityRequest!]!
  }

  type EntityRequestResponse {
    success: Boolean!
    message: String!
    entityRequest: EntityRequest
  }

  extend type Query {
    getUserEntities: EntitiesResponse
    getEntityStats(organizationId: String!): EntityStatsResponse
    getEntities(organizationId: String!, type: String, status: String, page: Int!, limit: Int!): EntitiesResponse
    getEntityByEntityId(entityId: String!): EntityResponse
    getEntityUserRoles(entityId: String!): EntityUserRolesResponse
    getEntityRequests(entityId: String!): EntityRequestsResponse
    getAllEntities: EntitiesResponse
    getRequestByEntityId(entityId: String!): EntityRequestsResponse
  }

  extend type Mutation {
    createEntity(input: CreateEntityInput!): EntityResponse
    updateEntity(id: ID!, input: UpdateEntityInput!): EntityResponse
    deleteEntity(id: ID!): EntityResponse
    removeEntityMember(id: ID!): EntityUserRoleResponse
    deleteEntityMember(id: ID!): EntityUserRoleResponse
    createEntityMember(input: CreateEntityUserRoleInput!): EntityUserRoleResponse
    archiveEntity(id: ID!): EntityResponse
    createEntityRequest(input: CreateEntityRequestInput!): EntityRequestResponse
    acceptEntityJoinRequest(requestId: String!): EntityRequestResponse
    rejectEntityJoinRequest(requestId: String!): EntityRequestResponse
  }
`;
