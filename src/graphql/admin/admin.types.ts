import { gql } from 'apollo-server-express';

export const adminTypes = gql`

  type InstituteJoinRequest {
    requestId: ID!
    instituteId: ID!
    userId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type InstituteJoinRequestStatus {
    requestId: ID!
    instituteId: ID!
    userId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type JoinRequestResponse {
    success: Boolean!
    message: String!
    request: InstituteJoinRequest
  }

  type JoinRequestsResponse {
    success: Boolean!
    message: String!
    requests: [InstituteJoinRequest!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  extend type Query {
    # Join request queries
    getJoinRequests(
      instituteId: ID!
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
