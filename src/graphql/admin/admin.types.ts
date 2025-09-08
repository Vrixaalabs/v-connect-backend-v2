import { gql } from 'apollo-server-express';

export const adminTypes = gql`
  type OrganizationJoinRequest {
    requestId: ID!
    organizationId: ID!
    userId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type OrganizationJoinRequestStatus {
    requestId: ID!
    organizationId: ID!
    userId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type JoinRequestResponse {
    success: Boolean!
    message: String!
    request: OrganizationJoinRequest
  }

  type JoinRequestsResponse {
    success: Boolean!
    message: String!
    requests: [OrganizationJoinRequest!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  extend type Query {
    # Join request queries
    getJoinRequests(
      organizationId: ID!
      status: String
      page: Int = 1
      limit: Int = 10
    ): JoinRequestsResponse!

    getJoinRequest(requestId: ID!): JoinRequestResponse!
  }

  extend type Mutation {
    # Join request mutations
    approveJoinRequest(requestId: ID!): JoinRequestResponse!
    rejectJoinRequest(requestId: ID!, reason: String!): JoinRequestResponse!
  }
`;
