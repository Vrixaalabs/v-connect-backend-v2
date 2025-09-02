import { gql } from 'apollo-server-express';

// Interfaces (used in resolvers)
export interface IUpdateUserArgs {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface Context {
  isAuthenticated: boolean;
  userId?: string; // useful for "me"
}

export interface IMockToken {
  success: boolean;
  newToken: string | null;
}

// GraphQL Types
export const alumniTypes = gql`
  type User {
    _id: ID!
    userId: String!
    firstName: String
    lastName: String
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input UpdateUserInput {
    username: String
    email: String
    firstName: String
    lastName: String
  }

  type UpdateUserPayload {
    success: Boolean!
    user: User!
  }

  type MockTokenResponse {
    success: Boolean
    newToken: String
  }

  # === AMA Session ===
type AMASession {
    _id: ID!
    title: String!
    description: String
    host: User!
    scheduledAt: String!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    # Users
    me: User
    user(id: ID!): User
    users(graduationYear: Int, department: String): [User!]

    # AMA
amaSessions(active: Boolean): [AMASession!]
    amaSession(id: ID!): AMASession

    # Mock
    getMockAuthToken(userId: String!): MockTokenResponse
  }

  extend type Mutation {
    # User auth & profile
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput): UpdateUserPayload
    resetPassword(id: String!, newPassword: String!): UpdateUserPayload

    # AMA
    createAMASession(
      title: String!
      description: String
      tags: [String!]
      scheduledAt: String!
    ): AMASession!

    endAMASession(id: ID!): AMASession!
  }
`;
