import { gql } from 'apollo-server-express';

export const sharedTypes = gql`
  type BaseResponse {
    success: Boolean!
    message: String!
  }

  type PaginatedResponse {
    total: Int!
    page: Int!
    limit: Int!
  }

  type Department {
    id: ID!
    name: String!
    code: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type OrganizationAddress {
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    pinCode: String!
  }

  type OrganizationRole {
    roleId: ID!
    organizationId: String!
    name: String!
    description: String!
    permissions: [String!]!
    isDefault: Boolean!
    createdBy: String!
    createdAt: String!
    updatedAt: String!
  }

  type OrganizationUserRole {
    assignmentId: ID!
    organizationId: String!
    userId: ID!
    roleId: ID!
    departmentId: String
    assignedBy: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input DepartmentInput {
    name: String!
    code: String!
    description: String
  }

  input OrganizationAddressInput {
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    pinCode: String!
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }
`;
