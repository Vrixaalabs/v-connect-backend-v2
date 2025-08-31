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
    website: String
    email: String!
    phone: String!
    address: InstituteAddress!
    departments: [Department!]!
    followers: [String!]!
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

  type InstituteJoinRequest {
    requestId: ID!
    instituteId: ID!
    userId: ID!
    fullName: String!
    email: String!
    rollNumber: String!
    departmentId: ID!
    batch: String!
    status: String!
    approvedBy: String
    rejectionReason: String
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

  input CreateJoinRequestInput {
    instituteId: ID!
    fullName: String!
    email: String!
    rollNumber: String!
    departmentId: ID!
    batch: String!
  }

  input InstituteFilterInput {
    name: String
    city: String
    state: String
    isVerified: Boolean
    isActive: Boolean
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
    # Institute mutations
    createInstitute(input: CreateInstituteInput!): InstituteResponse!
    updateInstitute(instituteId: ID!, input: UpdateInstituteInput!): InstituteResponse!
    deleteInstitute(instituteId: ID!): InstituteResponse!
    followInstitute(instituteId: ID!): InstituteResponse!
    unfollowInstitute(instituteId: ID!): InstituteResponse!
    
    # Role mutations
    createInstituteRole(
      instituteId: ID!
      input: CreateInstituteRoleInput!
    ): InstituteRoleResponse!
    
    updateInstituteRole(
      roleId: ID!
      input: UpdateInstituteRoleInput!
    ): InstituteRoleResponse!
    
    deleteInstituteRole(roleId: ID!): InstituteRoleResponse!
    
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
    
    # Join request mutations
    createJoinRequest(input: CreateJoinRequestInput!): JoinRequestResponse!
    approveJoinRequest(requestId: ID!): JoinRequestResponse!
    rejectJoinRequest(requestId: ID!, reason: String!): JoinRequestResponse!
  }
`;
