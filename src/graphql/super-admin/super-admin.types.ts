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

  input UpdateSuperAdminProfileInput {
    fullName: String!
    email: String!
  }

  input UpdatePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input UpdateSuperAdminSettingsInput {
    emailNotifications: Boolean!
    twoFactorAuth: Boolean!
    maintenanceMode: Boolean!
    notifyOnNewInstitute: Boolean!
    notifyOnSystemAlerts: Boolean!
    notifyOnSecurityAlerts: Boolean!
  }

  type SuperAdminSettings {
    emailNotifications: Boolean!
    twoFactorAuth: Boolean!
    maintenanceMode: Boolean!
    notifyOnNewInstitute: Boolean!
    notifyOnSystemAlerts: Boolean!
    notifyOnSecurityAlerts: Boolean!
  }

  type SuperAdminAuthResponse {
    success: Boolean!
    message: String!
    token: String
    requiresTwoFactor: Boolean
    user: User
  }

  type BasicResponse {
    success: Boolean!
    message: String!
  }

  type UserResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type SuperAdminSettingsResponse {
    success: Boolean!
    message: String!
    settings: SuperAdminSettings
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

    # Settings queries
    getSuperAdminSettings: SuperAdminSettings!
  }

  extend type Mutation {
    # Auth mutations
    superAdminLogin(email: String!, password: String!): SuperAdminAuthResponse!
    verifySuperAdmin2FA(email: String!, code: String!): SuperAdminAuthResponse!
    superAdminLogout: BasicResponse!

    # Profile mutations
    updateSuperAdminProfile(input: UpdateSuperAdminProfileInput!): UserResponse!
    updateSuperAdminPassword(input: UpdatePasswordInput!): BasicResponse!
    updateSuperAdminSettings(input: UpdateSuperAdminSettingsInput!): SuperAdminSettingsResponse!
    # Institute management mutations
    createInstitute(input: CreateInstituteInput!): InstituteResponse!
    updateInstitute(instituteId: ID!, input: UpdateInstituteInput!): InstituteResponse!
    deleteInstitute(instituteId: ID!): InstituteResponse!

    # Admin management mutations
    assignAdmin(input: AssignAdminInput!): InstituteAdminResponse!
    removeAdmin(adminId: ID!): InstituteAdminResponse!
  }
`;
