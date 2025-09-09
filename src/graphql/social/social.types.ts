import gql from 'graphql-tag';

export default gql`
  enum ActivityCategory {
    DRAMA
    MUSIC
    SHOOTING
    ENTREPRENEURSHIP
    SPORTS
    DANCE
    INDOOR_GAMES
    OTHER
  }

  type PortfolioEntry {
    title: String!
    description: String!
    link: String
    technologies: [String!]
  }

  type FriendProfile {
    userId: String!
    name: String
    avatarUrl: String
    bio: String
    department: String
    degree: String
    graduationYear: Int
    linkedin: String
    github: String
    portfolio: [PortfolioEntry!]
    createdAt: String!
    updatedAt: String!
  }

  type FriendConnection {
    id: ID!
    requesterUserId: String!
    recipientUserId: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    acceptedAt: String
  }

  type ActivityRequest {
    id: ID!
    title: String!
    description: String!
    category: ActivityCategory!
    createdByUserId: String!
    responses: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  input UpdateFriendProfileInput {
    name: String
    avatarUrl: String
    bio: String
    department: String
    degree: String
    graduationYear: Int
    linkedin: String
    github: String
  }

  input PortfolioEntryInput {
    title: String!
    description: String!
    link: String
    technologies: [String!]
  }

  input UpdatePortfolioInput {
    entries: [PortfolioEntryInput!]!
  }

  type FriendSuggestionsPayload {
    users: [FriendProfile!]!
  }

  type RandomUsersPayload {
    users: [FriendProfile!]!
  }

  type FriendListPayload {
    connections: [FriendProfile!]!
  }

  type ActivityRequestListPayload {
    requests: [ActivityRequest!]!
    total: Int!
  }

  type RequestRespondersPayload {
    responders: [FriendProfile!]!
  }

  type Query {
    getFriendProfile(userId: String!): FriendProfile
    getRandomUsers(limit: Int = 10): RandomUsersPayload!
    getSuggestedUsers(limit: Int = 10): FriendSuggestionsPayload!
    getFriends: FriendListPayload!
    getRequests(
      category: ActivityCategory
      limit: Int = 10
      offset: Int = 0
    ): ActivityRequestListPayload!
    getRequest(id: ID!): ActivityRequest
    getRequestResponders(requestId: ID!): RequestRespondersPayload!
  }

  type Mutation {
    updateFriendProfile(input: UpdateFriendProfileInput!): FriendProfile!
    updateFriendPortfolio(input: UpdatePortfolioInput!): FriendProfile!
    sendFriendRequest(targetUserId: String!): FriendConnection!
    acceptFriendRequest(requesterUserId: String!): FriendConnection!
    rejectFriendRequest(requesterUserId: String!): FriendConnection!
    removeFriend(friendUserId: String!): Boolean!
    createRequest(
      title: String!
      description: String!
      category: ActivityCategory!
    ): ActivityRequest!
    respondToRequest(requestId: ID!): ActivityRequest!
    withdrawResponse(requestId: ID!): ActivityRequest!
  }
`;
