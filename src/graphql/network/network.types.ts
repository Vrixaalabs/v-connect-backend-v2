export const networkTypes = `#graphql
  type FriendConnection {
    connectionId: ID!
    userId: ID!
    friendId: ID!
    status: FriendConnectionStatus!
    initiatedBy: ID!
    acceptedAt: DateTime
    rejectedAt: DateTime
    blockedAt: DateTime
    blockedBy: ID
    metadata: FriendConnectionMetadata
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type FriendConnectionMetadata {
    lastInteractionAt: DateTime
    mutualFriends: Int
    commonGroups: Int
  }

  enum FriendConnectionStatus {
    PENDING
    ACCEPTED
    REJECTED
    BLOCKED
  }

  type FriendProfile {
    profileId: ID!
    userId: ID!
    visibility: ProfileVisibility!
    bio: String
    interests: [String!]
    education: [Education!]
    experience: [Experience!]
    skills: [String!]
    socialLinks: [SocialLink!]
    achievements: [Achievement!]
    stats: ProfileStats
    lastActive: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Education {
    institute: String!
    degree: String!
    field: String!
    startYear: Int!
    endYear: Int
    current: Boolean!
  }

  type Experience {
    company: String!
    position: String!
    location: String!
    startDate: DateTime!
    endDate: DateTime
    current: Boolean!
    description: String
  }

  type SocialLink {
    platform: String!
    url: String!
  }

  type Achievement {
    title: String!
    description: String!
    date: DateTime!
    url: String
  }

  type ProfileStats {
    totalFriends: Int!
    mutualFriends: Int!
    totalPosts: Int!
    totalLikes: Int!
    totalComments: Int!
  }

  enum ProfileVisibility {
    PUBLIC
    FRIENDS
    PRIVATE
  }

  input CreateFriendConnectionInput {
    friendId: ID!
  }

  input UpdateFriendConnectionInput {
    status: FriendConnectionStatus!
  }

  input UpdateFriendProfileInput {
    visibility: ProfileVisibility
    bio: String
    interests: [String!]
    education: [EducationInput!]
    experience: [ExperienceInput!]
    skills: [String!]
    socialLinks: [SocialLinkInput!]
    achievements: [AchievementInput!]
  }

  input EducationInput {
    institute: String!
    degree: String!
    field: String!
    startYear: Int!
    endYear: Int
    current: Boolean!
  }

  input ExperienceInput {
    company: String!
    position: String!
    location: String!
    startDate: DateTime!
    endDate: DateTime
    current: Boolean!
    description: String
  }

  input SocialLinkInput {
    platform: String!
    url: String!
  }

  input AchievementInput {
    title: String!
    description: String!
    date: DateTime!
    url: String
  }

  type FriendConnectionResponse {
    success: Boolean!
    message: String!
    connection: FriendConnection
  }

  type FriendProfileResponse {
    success: Boolean!
    message: String!
    profile: FriendProfile
  }

  type FriendConnectionsResponse {
    success: Boolean!
    message: String!
    connections: [FriendConnection!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type FriendSuggestionsResponse {
    success: Boolean!
    message: String!
    suggestions: [FriendProfile!]!
    total: Int!
  }

  type NetworkStats {
    totalConnections: Int!
    pendingRequests: Int!
    mutualFriends: Int!
    commonInterests: Int!
    commonGroups: Int!
  }

  type NetworkStatsResponse {
    success: Boolean!
    message: String!
    stats: NetworkStats!
  }
`;
