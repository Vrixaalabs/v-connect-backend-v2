import { gql } from 'apollo-server-express';

export const jobTypes = gql`
  type JobItem {
    item: String!
    qty: Int!
    price: Float!
    cost: Float!
    amount: Float!
    taxable: Boolean!
  }

  type Payment {
    amount: Float!
    paymentType: String!
  }

  type Schedule {
    startTime: String!
    endTime: String!
  }

  enum JobStatus {
    SUBMITTED
    IN_PROGRESS
    CANCELLED
    DONE
    PENDING
    DONE_PENDING_APPROVAL
  }

  type Job {
    jobId: String!
    jobNumber: Int!
    clientId: ID!
    branchId: ID!
    client: Client!
    addressId: ID!
    address: Address!
    jobTypeId: ID!
    jobSourceId: ID!
    description: String
    techId: ID!
    schedule: Schedule
    jobItems: [JobItem!]
    payments: [Payment!]
    jobStatus: JobStatus!
    tags: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type JobListResult {
    success: Boolean!
    message: String!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    jobs: [Job!]
  }

  type GetJobByIdResp {
    success: Boolean!
    job: Job
  }

  type Stats {
    SUBMITTED: Int!
    IN_PROGRESS: Int!
    CANCELLED: Int!
    DONE: Int!
    PENDING: Int!
    DONE_PENDING_APPROVAL: Int!
  }

  type GetJobStatsResp {
    success: Boolean!
    stats: Stats
  }

  input JobItemInput {
    item: String!
    qty: Int!
    price: Float!
    cost: Float!
    amount: Float!
    taxable: Boolean!
  }

  input JobPaymentInput {
    amount: Float!
    paymentType: String!
  }

  input ScheduleInput {
    startTime: String!
    endTime: String!
  }

  input JobClientAddressInput {
    addressLine: String
    city: String
    region: String
    postalCode: String
    country: String
    map: JobClientMapInput
  }

  input JobClientMapInput {
    latitude: Float
    longitude: Float
  }

  input JobClientInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    altPhone: String
    companyName: String
    adSource: String
    allowBilling: Boolean!
    taxExempt: Boolean!
  }

  input CreateJobInput {
    clientId: ID
    branchId: String!
    jobTypeId: ID!
    jobSourceId: String!
    description: String
    techId: String!
    schedule: ScheduleInput
    jobItems: [JobItemInput!]
    payments: [JobPaymentInput!]
    jobStatus: JobStatus
    tags: [String!]
    client: JobClientInput
    address: AddressInput
  }

  type CreateJobResp {
    success: Boolean!
    message: String!
    job: Job
  }

  input UpdateJobInput {
    clientId: ID
    jobTypeId: ID
    jobSourceId: String
    description: String
    techId: String
    schedule: ScheduleInput
    jobItems: [JobItemInput!]
    payments: [JobPaymentInput!]
    jobStatus: JobStatus!
    tags: [String!]
    client: JobClientInput
  }

  type UpdateJobResp {
    success: Boolean!
    message: String!
    job: Job
  }

  type DeleteJobResp {
    success: Boolean!
    message: String!
  }

  type JobResponse {
    success: Boolean!
    message: String!
    job: Job
  }

  type DeleteJobResponse {
    success: Boolean!
    message: String!
  }

  type JobList {
    success: Boolean!
    message: String!
    jobs: [Job!]
    total: Int!
    page: Int!
    limit: Int
  }

  input ScheduleInput {
    startTime: String!
    endTime: String!
  }

  input JobPaymentInput {
    amount: Float!
    paymentType: String!
  }

  type JobListResp {
    success: Boolean!
    message: String!
    jobs: [Job!]
    total: Int!
    page: Int!
    limit: Int
  }

  type JobType {
    jobTypeId: ID!
    branchId: ID!
    franchiseeId: ID!
    name: String!
    description: String!
    displayOrder: Int!
    days: Int!
    hours: Int!
    minutes: Int!
  }

  input ListJobTypesArgs {
    page: Int
    limit: Int
    search: String

    branchId: ID!
    franchiseeId: ID
    name: String
    description: String
    displayOrder: Int
    days: Int
    hours: Int
    minutes: Int
  }

  type JobTypeListResp {
    success: Boolean!
    message: String!
    jobTypes: [JobType!]
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateJobTypeInput {
    branchId: ID!
    franchiseeId: ID!
    name: String!
    description: String!
    displayOrder: Int!
    days: Int!
    hours: Int!
    minutes: Int!
  }

  type JobTypeResponse {
    success: Boolean!
    message: String!
    jobType: JobType
  }

  type JobSource {
    jobSourceId: ID!
    branchId: ID!
    franchiseeId: ID
    name: String!
    description: String
    displayOrder: Int
    createdAt: String!
    updatedAt: String!
  }

  type JobSourceListResp {
    success: Boolean!
    message: String!
    jobSources: [JobSource!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input CreateJobSourceInput {
    name: String!
    description: String!
    displayOrder: Int!
  }

  type JobSourceResponse {
    success: Boolean!
    message: String!
    jobSource: JobSource
  }

  extend type Query {
    listJobsByBranch(
      page: Int = 1
      limit: Int = 10
      branchId: ID!
      jobNumber: Int
      jobTypeId: String
      jobSourceId: String
      techId: String
      jobStatus: JobStatus
      tags: [String!]
      startDate: String
      endDate: String
      search: String
    ): JobListResult!
    getJobByJobId(jobId: String!): GetJobByIdResp!
    getJobStatsByBranch(branchId: ID!): GetJobStatsResp!
    listJobTypesByBranch(
      page: Int = 1
      limit: Int = 10
      branchId: ID!
      franchiseeId: ID
      search: String
      displayOrder: Int
      days: Int
      hours: Int
      minutes: Int
    ): JobTypeListResp!
    listJobSourcesByBranch(
      page: Int = 1
      limit: Int = 10
      search: String
      branchId: ID!
      franchiseeId: ID
      name: String
      description: String
      displayOrder: Int
    ): JobSourceListResp!
  }

  extend type Mutation {
    createJob(input: CreateJobInput!): CreateJobResp!
    updateJob(jobId: ID!, input: UpdateJobInput!): UpdateJobResp!
    deleteJob(jobId: ID!): DeleteJobResp!
    createJobType(input: CreateJobTypeInput!): JobTypeResponse!
    createJobSource(input: CreateJobSourceInput!): JobSourceResponse!
  }
`;
