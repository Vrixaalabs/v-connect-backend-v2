import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Department } from '../../models/Department';
import { Institute } from '../../models/Institute';
import { BaseError } from '../../types/errors/base.error';
import { GetDepartmentsArgs, DepartmentResponse, DepartmentsResponse } from './department.interfaces';

export const departmentQueries = {
  getDepartment: async (
    _: unknown,
    { departmentId }: { departmentId: string },
    { isAuthenticated }: GraphQLContext
  ): Promise<DepartmentResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const department = await Department.findOne({ departmentId });
      if (!department) {
        throw createError.notFound(`Department with ID ${departmentId} not found`);
      }

      return {
        success: true,
        message: 'Department fetched successfully',
        department,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch department', {
        operation: 'getDepartment',
        departmentId,
        error,
      });
    }
  },

  getDepartments: async (
    _: unknown,
    { instituteId, page = 1, limit = 10, search }: GetDepartmentsArgs,
    { isAuthenticated }: GraphQLContext
  ): Promise<DepartmentsResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Check if institute exists
      const institute = await Institute.findOne({ instituteId });
      if (!institute) {
        throw createError.notFound(`Institute with ID ${instituteId} not found`);
      }

      const query: any = { instituteId };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ];
      }

      const [total, departments] = await Promise.all([
        Department.countDocuments(query),
        Department.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
      ]);

      return {
        success: true,
        message: 'Departments fetched successfully',
        departments,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch departments', {
        operation: 'getDepartments',
        instituteId,
        error,
      });
    }
  },
};
