import { Document } from 'mongoose';
import { IDepartment } from '../../models/Department';

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  instituteId: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  department?: IDepartment & Document;
}

export interface DepartmentsResponse {
  success: boolean;
  message: string;
  departments: Array<IDepartment & Document>;
  total: number;
  page: number;
  limit: number;
}

export interface GetDepartmentsArgs {
  instituteId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateDepartmentArgs {
  departmentId: string;
  input: UpdateDepartmentInput;
}
