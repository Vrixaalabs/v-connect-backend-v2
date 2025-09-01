import { GraphQLContext } from '../context';
import { createError } from '../../middleware/errorHandler';
import { Department } from '../../models/Department';
import { Institute } from '../../models/Institute';
import { BaseError } from '../../types/errors/base.error';
import {
  CreateDepartmentInput,
  UpdateDepartmentArgs,
  DepartmentResponse,
} from './department.interfaces';

export const departmentMutations = {
  createDepartment: async (
    _: unknown,
    { input }: { input: CreateDepartmentInput },
    { isAuthenticated, user }: GraphQLContext
  ): Promise<DepartmentResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      // Check if institute exists
      const institute = await Institute.findOne({ instituteId: input.instituteId });
      if (!institute) {
        throw createError.notFound(`Institute with ID ${input.instituteId} not found`);
      }

      // Check if department code is unique in the institute
      const existingDepartment = await Department.findOne({
        instituteId: input.instituteId,
        $or: [
          { code: input.code },
          { name: input.name },
        ],
      });

      if (existingDepartment) {
        throw createError.conflict(
          `Department with ${existingDepartment.code === input.code ? 'code' : 'name'} already exists in this institute`
        );
      }

      // Create department
      const department = await Department.create({
        ...input,
        createdBy: user?.id,
      });

      // Update institute department count
      await Institute.updateOne(
        { instituteId: input.instituteId },
        { $inc: { departmentCount: 1 } }
      );

      return {
        success: true,
        message: 'Department created successfully',
        department,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create department', {
        operation: 'createDepartment',
        input,
        error,
      });
    }
  },

  updateDepartment: async (
    _: unknown,
    { departmentId, input }: UpdateDepartmentArgs,
    { isAuthenticated, user }: GraphQLContext
  ): Promise<DepartmentResponse> => {
    try {
      if (!isAuthenticated) {
        throw createError.authentication('Not authenticated');
      }

      const department = await Department.findOne({ departmentId });
      if (!department) {
        throw createError.notFound(`Department with ID ${departmentId} not found`);
      }

      // If updating code or name, check for uniqueness
      if (input.code || input.name) {
        const existingDepartment = await Department.findOne({
          departmentId: { $ne: departmentId },
          instituteId: department.instituteId,
          $or: [
            input.code ? { code: input.code } : null,
            input.name ? { name: input.name } : null,
          ].filter(Boolean),
        });

        if (existingDepartment) {
          throw createError.conflict(
            `Department with ${existingDepartment.code === input.code ? 'code' : 'name'} already exists in this institute`
          );
        }
      }

      const updatedDepartment = await Department.findOneAndUpdate(
        { departmentId },
        {
          $set: {
            ...input,
            updatedBy: user?.id,
          },
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Department updated successfully',
        department: updatedDepartment,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update department', {
        operation: 'updateDepartment',
        departmentId,
        input,
        error,
      });
    }
  },

  deleteDepartment: async (
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

      // Check if department has any students or faculty
      if (department.studentsCount > 0 || department.facultyCount > 0) {
        throw createError.conflict(
          'Cannot delete department with active students or faculty'
        );
      }

      await Department.deleteOne({ departmentId });

      // Update institute department count
      await Institute.updateOne(
        { instituteId: department.instituteId },
        { $inc: { departmentCount: -1 } }
      );

      return {
        success: true,
        message: 'Department deleted successfully',
        department,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete department', {
        operation: 'deleteDepartment',
        departmentId,
        error,
      });
    }
  },
};
