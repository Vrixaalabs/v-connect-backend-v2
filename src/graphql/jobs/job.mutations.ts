import { createError } from '../../middleware/errorHandler';
import { Address } from '../../models/Address';
import { Client } from '../../models/Client';
import { Job } from '../../models/Job';
import { JobSource } from '../../models/JobSource';
import { JobType } from '../../models/JobType';
import { BaseError } from '../../types/errors/base.error';
import {
  Context,
  CreateJobArgs,
  CreateJobSourceArgs,
  CreateJobTypeArgs,
  JobResult,
  JobSourceResult,
  JobTypeResult,
  UpdateJobArgs,
} from './jobs.interfaces';

export const jobMutations = {
  createJob: async (
    _: unknown,
    args: { input: CreateJobArgs },
    { isAuthenticated }: Context
  ): Promise<JobResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    const { input } = args;
    const { branchId, client, address, ...jobData } = input;
    try {
      // Create address & collect UUID
      const newAddress = await Address.create({
        addressLine: address.addressLine,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country,
        map: {
          latitude: address.map.latitude,
          longitude: address.map.longitude,
        },
        isPrimary: address.isPrimary,
        type: address.type,
      });
      const newAddressId = newAddress.addressId;

      let clientId = input.clientId;
      if (!clientId) {
        if (!input.client) {
          throw createError.validation(
            'Client details are required when clientId is not provided'
          );
        }

        const { phone, ...clientData } = client;
        const existingClient = await Client.findOne({
          branchId,
          phone,
        });

        if (existingClient) {
          throw createError.validation(
            'A client with the same phone and email already exists for this branch'
          );
        }

        // Create the new client
        const newClient = await Client.create({
          branchId,
          phone,
          addressIds: [newAddressId],
          ...clientData,
        });

        clientId = newClient.clientId;
      }

      const job = await Job.create({
        branchId,
        addressId: newAddressId,
        ...jobData,
        clientId,
      });

      return {
        success: true,
        message: 'Job created successfully',
        job,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create job', {
        operation: 'create',
        entityType: 'Job',
        error: error,
      });
    }
  },
  updateJob: async (
    _: unknown,
    args: UpdateJobArgs,
    { isAuthenticated }: Context
  ): Promise<JobResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const job = await Job.findOneAndUpdate(
        { jobId: args.jobId },
        { $set: { ...args } },
        { new: true }
      );

      if (!job) {
        return { success: false, message: 'Job not found' };
      }

      return {
        success: true,
        message: 'Job updated successfully',
        job,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to update job', {
        operation: 'update',
        entityType: 'Job',
        error: error,
      });
    }
  },
  deleteJob: async (
    _: unknown,
    args: { jobId: string },
    { isAuthenticated }: Context
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const deleted = await Job.findOneAndDelete({ jobId: args.jobId });

      if (!deleted) {
        return { success: false, message: 'Job not found' };
      }

      return {
        success: true,
        message: 'Job deleted successfully',
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to delete job', {
        operation: 'delete',
        entityType: 'Job',
        error: error,
      });
    }
  },
  createJobType: async (
    _: unknown,
    args: { input: CreateJobTypeArgs },
    { isAuthenticated }: Context
  ): Promise<JobTypeResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const jobType = await JobType.create({
        ...args.input,
      });

      return {
        success: true,
        message: 'Job type created successfully',
        jobType,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create job type', {
        operation: 'create',
        entityType: 'JobType',
      });
    }
  },
  createJobSource: async (
    _: unknown,
    args: { input: CreateJobSourceArgs },
    { isAuthenticated }: Context
  ): Promise<JobSourceResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }

    try {
      const jobSource = await JobSource.create({
        ...args.input,
      });

      return {
        success: true,
        message: 'Job source created successfully',
        jobSource,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create job source', {
        operation: 'create',
        entityType: 'JobSource',
      });
    }
  },
};
