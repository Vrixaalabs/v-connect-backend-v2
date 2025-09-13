import { gql } from 'apollo-server-express';

export const userTypes = gql`
  type User {
    _id: ID!
    userId: String!
    firstName: String
    lastName: String
    avatar: String
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

  type VerifyEmailPayload {
    success: Boolean!
    message: String!
    user: User 
  }

  type ResendVerificationEmailPayload {
    success: Boolean!
    message: String!
    user: User
  }

  type CheckEmailVerificationPayload {
    success: Boolean!
    message: String!
    user: User
  }

  extend type Query {
    me: User
    users: [User!]!
    getMockAuthToken(userId: String!): MockTokenResponse
    checkEmailVerification(email: String!): CheckEmailVerificationPayload
  }

  extend type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput): UpdateUserPayload
    resetPassword(id: String!, newPassword: String!): UpdateUserPayload
    verifyEmail(token: String!): VerifyEmailPayload
    resendVerificationEmail(email: String!): VerifyEmailPayload
  }
`;
