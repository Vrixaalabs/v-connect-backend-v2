export const entityTypes = `#graphql
  type Entity {
    entityId: ID!
    name: String!
    type: EntityType!
    description: String
    organizationId: ID!
    parentEntityId: ID
    status: EntityStatus!
    logo: String
    banner: String
    members: [EntityMember!]
    settings: EntitySettings!
    metadata: EntityMetadata
    createdBy: ID!
    updatedBy: ID
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type EntityMember {
    userId: ID!
    role: String!
    joinedAt: DateTime!
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
    lastActivityAt: DateTime
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
    organizationId: ID!
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
    userId: ID!
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
`;
