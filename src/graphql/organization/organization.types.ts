import { gql } from 'apollo-server-express';

export const organizationTypes = gql`
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

  type Organization {
    instituteId: ID!
    name: String!
    slug: String!
    description: String!
    logo: String
    banner: String
    coverImage: String
    website: String
    email: String!
    phone: String!
    address: OrganizationAddress!
    departments: [Department!]
    followers: [String!]!
    studentsCount: Int!
    followersCount: Int!
    isVerified: Boolean!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type OrganizationRole {
    roleId: ID!
    instituteId: ID!
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
    instituteId: ID!
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

  input CreateOrganizationInput {
    name: String!
    description: String!
    logo: String
    banner: String
    website: String
    email: String!
    phone: String!
    address: OrganizationAddressInput
    departments: [DepartmentInput!]
  }

  input UpdateOrganizationInput {
    name: String
    description: String
    logo: String
    banner: String
    website: String
    email: String
    phone: String
    address: OrganizationAddressInput
    departments: [DepartmentInput!]
  }

  input CreateOrganizationRoleInput {
    name: String!
    description: String!
    permissions: [String!]!
    isDefault: Boolean
  }

  input UpdateOrganizationRoleInput {
    name: String
    description: String
    permissions: [String!]
    isDefault: Boolean
  }

  input OrganizationFilterInput {
    name: String
    city: String
    state: String
    isVerified: Boolean
    isActive: Boolean
    search: String
  }

  type OrganizationResponse {
    success: Boolean!
    message: String!
    institute: Institute
  }

  type OrganizationsResponse {
    success: Boolean!
    message: String!
    institutes: [Institute!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type OrganizationRoleResponse {
    success: Boolean!
    message: String!
    role: OrganizationRole
  }

  type OrganizationRolesResponse {
    success: Boolean!
    message: String!
    roles: [OrganizationRole!]!
  }

  input CreateJoinRequestInput {
    organizationId: ID!
    userId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    # Organization queries
    searchOrganizations(
      filter: OrganizationFilterInput
      page: Int = 1
      limit: Int = 10
    ): OrganizationsResponse!
    
    getOrganizationBySlug(slug: String!): OrganizationResponse!
    getOrganizationById(organizationId: ID!): OrganizationResponse!
    
    # Role queries
    getOrganizationRoles(organizationId: ID!): OrganizationRolesResponse!
    getOrganizationRole(roleId: ID!): OrganizationRoleResponse!
  }

  extend type Mutation {    
    assignOrganizationRole(
      organizationId: ID!
      userId: ID!
      roleId: ID!
      departmentId: ID
    ): OrganizationRoleResponse!
    
    removeOrganizationRole(
      organizationId: ID!
      userId: ID!
    ): OrganizationRoleResponse!

    # Organization mutations
    followOrganization(organizationId: ID!): OrganizationResponse!
    unfollowOrganization(organizationId: ID!): OrganizationResponse!

    createOrganizationRole(organizationId: ID!, input: CreateOrganizationRoleInput!): OrganizationRoleResponse!
    updateOrganizationRole(roleId: ID!, input: UpdateOrganizationRoleInput!): OrganizationRoleResponse!
    deleteOrganizationRole(roleId: ID!): OrganizationRoleResponse!

    createJoinRequest(input: CreateJoinRequestInput!): JoinRequestResponse!
  }
`;