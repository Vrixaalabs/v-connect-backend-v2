export const entityTypes = `#graphql
  type Entity {
    entityId: String!
    name: String!
    type: EntityType!
    code: String
    description: String
    organizationId: String
    parentEntityId: String
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

  type EntityMemberRole {
    roleId: String!
    name: String!
    permissions: [String!]!
  }

  type EntityMember {
    user: User!
    role: EntityMemberRole
    joinedAt: String!
    status: MemberStatus!
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
    CLUB
    DEPARTMENT
    COMMITTEE
    TEAM
  }

  enum EntityStatus {
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  enum MemberStatus {
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

  input AddEntityMemberInput {
    userId: String!
    role: String!
  }

  input UpdateEntityMemberInput {
    role: String
    status: MemberStatus
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

  type EntityMemberResponse {
    success: Boolean!
    message: String!
    member: EntityMember
  }

  type EntityMembersResponse {
    success: Boolean!
    message: String!
    members: [EntityMember!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type EntityStats {
    totalEntities: Int!
    entitiesByType: [EntityTypeCount!]!
    entitiesByStatus: [EntityStatusCount!]!
    totalMembers: Int!
    activeMembers: Int!
    averageMembersPerEntity: Float!
  }

  input CreateEntityMemberInput {
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

  extend type Query {
    getUserEntities: EntitiesResponse
    getEntityStats(organizationId: String!): EntityStatsResponse
    getEntities(organizationId: String!, type: String, status: String, page: Int!, limit: Int!): EntitiesResponse
    getEntityByEntityId(entityId: String!): EntityResponse
    getEntityMembers(entityId: String!): EntityMembersResponse
  }

  extend type Mutation {
    createEntity(input: CreateEntityInput!): EntityResponse
    updateEntity(id: ID!, input: UpdateEntityInput!): EntityResponse
    deleteEntity(id: ID!): EntityResponse
    # addEntityMember(input: AddEntityMemberInput!): EntityMemberResponse
    # updateEntityMember(id: ID!, input: UpdateEntityMemberInput!): EntityMemberResponse
    removeEntityMember(id: ID!): EntityMemberResponse
    deleteEntityMember(id: ID!): EntityMemberResponse
    createEntityMember(input: CreateEntityMemberInput!): EntityMemberResponse
    archiveEntity(id: ID!): EntityResponse
  }
`;
