import { gql } from 'apollo-server-express';

export const superAdminTypes = gql`
  type SuperAdminDashboardStats {
    totalInstitutes: Int!
    totalStudents: Int!
    totalDepartments: Int!
    activeAdmins: Int!
  }

  type RecentActivity {
    id: ID!
    type: String!
    message: String!
    time: String!
    instituteId: String
    userId: String
  }

  type SystemStatus {
    status: String!
    load: Float!
    lastUpdated: String!
  }

  type InstituteAdminResponse {
    success: Boolean!
    message: String!
    admin: InstituteUserRole
  }

  type InstituteAdminsResponse {
    success: Boolean!
    message: String!
    admins: [InstituteUserRole!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input AssignAdminInput {
    email: String!
    instituteId: ID!
  }

  extend type Query {
    # Dashboard queries
    getSuperAdminDashboardStats: SuperAdminDashboardStats!
    getRecentActivities(limit: Int = 10): [RecentActivity!]!
    getSystemStatus: SystemStatus!

    # Admin management queries
    getInstituteAdmins(
      page: Int = 1
      limit: Int = 10
      search: String
    ): InstituteAdminsResponse!
    getInstituteAdmin(adminId: ID!): InstituteAdminResponse!
  }

  extend type Mutation {
    # Institute management mutations
    createInstitute(input: CreateInstituteInput!): InstituteResponse!
    updateInstitute(instituteId: ID!, input: UpdateInstituteInput!): InstituteResponse!
    deleteInstitute(instituteId: ID!): InstituteResponse!

    # Admin management mutations
    assignAdmin(input: AssignAdminInput!): InstituteAdminResponse!
    removeAdmin(adminId: ID!): InstituteAdminResponse!
  }
`;
