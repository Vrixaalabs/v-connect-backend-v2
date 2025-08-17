import { gql } from 'apollo-server-express';

export const franchiseeTypes = gql`
  input RoleInput {
    name: String!
    description: String
    permissions: [PermissionInput!]!
  }

  input PermissionInput {
    resource: String!
    actions: [String!]!
  }

  type Role {
    roleId: String!
    name: String!
    description: String
    permissions: [Permission!]!
    isSystemRole: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Permission {
    resource: String!
    actions: [String!]!
  }

  type RoleResponse {
    success: Boolean!
    message: String
    role: Role
  }

  type Franchisee {
    franchiseeId: String!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type FranchiseePaginatedResponse {
    success: Boolean!
    message: String
    franchisees: [Franchisee!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type FranchiseeResponse {
    success: Boolean!
    message: String
    franchisee: Franchisee
  }

  input CreateFranchiseeInput {
    name: String!
    description: String
  }

  input UpdateFranchiseeInput {
    name: String
    description: String
  }

  type DeleteFranchiseeResponse {
    success: Boolean!
    message: String
  }

  type CreateFranchiseeResponse {
    success: Boolean!
    message: String
    franchisee: Franchisee
  }

  type UpdateFranchiseeResponse {
    success: Boolean!
    message: String
    franchisee: Franchisee
  }

  type DeleteFranchiseeResponse {
    success: Boolean!
    message: String
  }

  type Query {
    getFranchisee(franchiseeId: ID!): FranchiseeResponse!
    listFranchisees(
      page: Int = 1
      limit: Int = 10
    ): FranchiseePaginatedResponse!
  }

  input CreateRoleInput {
    name: String!
    description: String
    permissions: [PermissionInput!]!
  }

  type CreateRoleResponse {
    success: Boolean!
    message: String
    role: Role
  }

  type Mutation {
    createRole(input: CreateRoleInput!): RoleResponse!
    createFranchisee(input: CreateFranchiseeInput!): FranchiseeResponse!
    updateFranchisee(
      franchiseeId: ID!
      input: UpdateFranchiseeInput!
    ): FranchiseeResponse!
    deleteFranchisee(franchiseeId: ID!): FranchiseeResponse!
  }
`;
