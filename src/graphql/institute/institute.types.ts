import { gql } from 'apollo-server-express';

export const instituteTypes = gql`
  type Department {
    id: ID!
    name: String!
    code: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type InstituteAddress {
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    pinCode: String!
  }

  type Institute {
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
    address: InstituteAddress!
    departments: [Department!]!
    followers: [String!]!
    studentsCount: Int!
    followersCount: Int!
    isVerified: Boolean!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type InstituteRole {
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

  type InstituteUserRole {
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

  input InstituteAddressInput {
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    pinCode: String!
  }

  input CreateInstituteInput {
    name: String!
    description: String!
    logo: String
    banner: String
    website: String
    email: String!
    phone: String!
    address: InstituteAddressInput!
    departments: [DepartmentInput!]!
  }

  input UpdateInstituteInput {
    name: String
    description: String
    logo: String
    banner: String
    website: String
    email: String
    phone: String
    address: InstituteAddressInput
    departments: [DepartmentInput!]
  }

  input CreateInstituteRoleInput {
    name: String!
    description: String!
    permissions: [String!]!
    isDefault: Boolean
  }

  input UpdateInstituteRoleInput {
    name: String
    description: String
    permissions: [String!]
    isDefault: Boolean
  }

  input InstituteFilterInput {
    name: String
    city: String
    state: String
    isVerified: Boolean
    isActive: Boolean
    search: String
  }

  type InstituteResponse {
    success: Boolean!
    message: String!
    institute: Institute
  }

  type InstitutesResponse {
    success: Boolean!
    message: String!
    institutes: [Institute!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type InstituteRoleResponse {
    success: Boolean!
    message: String!
    role: InstituteRole
  }

  type InstituteRolesResponse {
    success: Boolean!
    message: String!
    roles: [InstituteRole!]!
  }

  input CreateJoinRequestInput {
    instituteId: ID!
    userId: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    # Institute queries
    searchInstitutes(
      filter: InstituteFilterInput
      page: Int = 1
      limit: Int = 10
    ): InstitutesResponse!
    
    getInstituteBySlug(slug: String!): InstituteResponse!
    getInstituteById(instituteId: ID!): InstituteResponse!
    
    # Role queries
    getInstituteRoles(instituteId: ID!): InstituteRolesResponse!
    getInstituteRole(roleId: ID!): InstituteRoleResponse!
  }

  extend type Mutation {    
    assignInstituteRole(
      instituteId: ID!
      userId: ID!
      roleId: ID!
      departmentId: ID
    ): InstituteRoleResponse!
    
    removeInstituteRole(
      instituteId: ID!
      userId: ID!
    ): InstituteRoleResponse!

    # Institute mutations
    followInstitute(instituteId: ID!): InstituteResponse!
    unfollowInstitute(instituteId: ID!): InstituteResponse!

    createInstituteRole(instituteId: ID!, input: CreateInstituteRoleInput!): InstituteRoleResponse!
    updateInstituteRole(roleId: ID!, input: UpdateInstituteRoleInput!): InstituteRoleResponse!
    deleteInstituteRole(roleId: ID!): InstituteRoleResponse!

    createJoinRequest(input: CreateJoinRequestInput!): JoinRequestResponse!
  }
`;