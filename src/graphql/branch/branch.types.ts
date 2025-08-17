import { gql } from 'apollo-server-express';

export const branchTypes = gql`
  type Branch {
    branchId: ID!
    franchiseeId: ID!
    name: String!
    code: String!
    type: BranchType!
    status: BranchStatus!
    addressId: ID!
    address: Address!
    contact: Contact
    operatingHours: OperatingHours
    settings: BranchSettings
    metadata: BranchMetadata
    createdAt: String!
    updatedAt: String!
  }

  enum BranchType {
    main
    sub
  }

  enum BranchStatus {
    active
    inactive
    closed
  }

  type Coordinates {
    latitude: Float
    longitude: Float
  }

  type Contact {
    phone: String
    email: String
    managerName: String
  }

  type DayHours {
    open: String
    close: String
    isOpen: Boolean!
  }

  type OperatingHours {
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
  }

  type BranchSettings {
    timezone: String
    currency: String
    taxRate: Float
  }

  type BranchMetadata {
    openingDate: String
    renovationDates: [String]
    lastInspectionDate: String
  }

  input CreateBranchInput {
    name: String!
    code: String!
    type: BranchType
    status: BranchStatus
    address: AddressInput
    contact: ContactInput
    operatingHours: OperatingHoursInput
    settings: BranchSettingsInput
    metadata: BranchMetadataInput
  }

  input UpdateBranchInput {
    name: String
    code: String
    type: BranchType
    status: BranchStatus
    address: AddressInput
    contact: ContactInput
    operatingHours: OperatingHoursInput
    settings: BranchSettingsInput
    metadata: BranchMetadataInput
  }

  input CoordinatesInput {
    latitude: Float
    longitude: Float
  }

  input ContactInput {
    phone: String
    email: String
    managerName: String
  }

  input DayHoursInput {
    open: String
    close: String
    isOpen: Boolean!
  }

  input OperatingHoursInput {
    monday: DayHoursInput
    tuesday: DayHoursInput
    wednesday: DayHoursInput
    thursday: DayHoursInput
    friday: DayHoursInput
    saturday: DayHoursInput
    sunday: DayHoursInput
  }

  input BranchSettingsInput {
    timezone: String
    currency: String
    taxRate: Float
  }

  input BranchMetadataInput {
    openingDate: String
    renovationDates: [String]
    lastInspectionDate: String
  }

  type CreateBranchResponse {
    success: Boolean!
    message: String
    branch: Branch
  }

  type UpdateBranchResponse {
    success: Boolean!
    message: String
    branch: Branch
  }

  type DeleteBranchResponse {
    success: Boolean!
    message: String
  }

  type BranchPaginatedResponse {
    success: Boolean!
    message: String
    branches: [Branch!]
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  extend type Query {
    getBranchById(branchId: ID!): CreateBranchResponse!
    listBranchesByFranchisee(
      page: Int = 1
      limit: Int = 10
      name: String
      code: String
      type: String
      status: String
      phone: String
      email: String
      managerName: String
      timezone: String
    ): BranchPaginatedResponse!
  }

  extend type Mutation {
    createBranch(input: CreateBranchInput!): CreateBranchResponse!
    updateBranch(
      branchId: ID!
      input: UpdateBranchInput!
    ): UpdateBranchResponse!
    deleteBranch(branchId: ID!): DeleteBranchResponse!
  }
`;
