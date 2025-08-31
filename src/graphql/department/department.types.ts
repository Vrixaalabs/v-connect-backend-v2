import { gql } from 'apollo-server-express';

export const departmentTypes = gql`
  type Department {
    departmentId: ID!
    name: String!
    code: String!
    description: String
    instituteId: ID!
    institute: Institute
    studentsCount: Int!
    facultyCount: Int!
    isActive: Boolean!
    createdBy: User
    updatedBy: User
    createdAt: String!
    updatedAt: String!
  }

  input CreateDepartmentInput {
    name: String!
    code: String!
    description: String
    instituteId: ID!
  }

  input UpdateDepartmentInput {
    name: String
    code: String
    description: String
    isActive: Boolean
  }

  type DepartmentResponse {
    success: Boolean!
    message: String!
    department: Department
  }

  type DepartmentsResponse {
    success: Boolean!
    message: String!
    departments: [Department!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  extend type Query {
    # Department queries
    getDepartment(departmentId: ID!): DepartmentResponse!
    getDepartments(
      instituteId: ID!
      page: Int = 1
      limit: Int = 10
      search: String
    ): DepartmentsResponse!
  }

  extend type Mutation {
    # Department mutations
    createDepartment(input: CreateDepartmentInput!): DepartmentResponse!
    updateDepartment(departmentId: ID!, input: UpdateDepartmentInput!): DepartmentResponse!
    deleteDepartment(departmentId: ID!): DepartmentResponse!
  }
`;
