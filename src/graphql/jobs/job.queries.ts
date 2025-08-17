import { IJob } from '@/types/types';
import { FilterQuery } from 'mongoose';
import { createError } from '../../middleware/errorHandler';
import { Job } from '../../models/Job';
import { JobSource } from '../../models/JobSource';
import { JobType } from '../../models/JobType';
import { BaseError } from '../../types/errors/base.error';
import {
  Context,
  GetJobByJobIdResult,
  JobListResult,
  JobSourceListResult,
  JobSourceQuery,
  JobStatsResult,
  JobTypeListResult,
  JobTypeQuery,
  ListJobsArgs,
  ListJobSourcesArgs,
  ListJobTypesArgs,
} from './jobs.interfaces';

export const jobQueries = {
  listJobsByBranch: async (
    _: unknown,
    args: ListJobsArgs,
    { isAuthenticated }: Context
  ): Promise<JobListResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not authenticated');
    }
    try {
      const {
        page = 1,
        limit = 10,
        jobNumber,
        jobTypeId,
        jobSourceId,
        techId,
        jobStatus,
        tags,
        startDate,
        endDate,
        search,
        branchId,
      } = args;

      const filters: FilterQuery<IJob> = {
        branchId,
      };
      if (jobNumber) filters.jobNumber = jobNumber;
      if (jobTypeId) filters.jobTypeId = jobTypeId;
      if (jobSourceId) filters.jobSourceId = jobSourceId;
      if (techId) filters.techId = techId;
      if (jobStatus) filters.jobStatus = jobStatus;

      if (tags?.length) {
        filters.tags = { $all: tags };
      }

      if (search) {
        filters.$or = [
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ] as NonNullable<FilterQuery<IJob>['$or']>;
      }

      if (startDate || endDate) {
        filters['schedule.startTime'] = {};
        if (startDate) filters['schedule.startTime'].$gte = new Date(startDate);
        if (endDate) filters['schedule.startTime'].$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const jobs = await Job.find(filters)
        .populate('client')
        .populate('jobType')
        .populate('jobSource')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Job.countDocuments(filters);

      return {
        success: true,
        message: 'Jobs fetched successfully',
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        jobs,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to list jobs', {
        operation: 'list',
        entityType: 'Job',
      });
    }
  },
  getJobByJobId: async (
    _: unknown,
    { jobId }: { jobId: string },
    { isAuthenticated }: Context
  ): Promise<GetJobByJobIdResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Unauthorized');
    }
    try {
      const job = await Job.findOne({ jobId })
        .populate('client')
        .populate('jobType')
        .populate('jobSource')
        .lean();

      if (!job) {
        throw createError.notFound(`Job with jobId "${jobId}" not found`);
      }

      return {
        success: true,
        job,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to get job', {
        operation: 'get',
        entityType: 'Job',
      });
    }
  },
  getJobStatsByBranch: async (
    _: unknown,
    args: { branchId: string },
    { isAuthenticated }: Context
  ): Promise<JobStatsResult> => {
    if (!isAuthenticated) {
      throw createError.authentication('Not Authorized');
    }
    try {
      const { branchId } = args;
      const statuses: IJob['jobStatus'][] = [
        'SUBMITTED',
        'IN_PROGRESS',
        'CANCELLED',
        'DONE',
        'PENDING',
        'DONE_PENDING_APPROVAL',
      ];

      const stats = await Job.aggregate([
        { $match: { branchId } },
        {
          $group: {
            _id: '$jobStatus',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            jobStatus: '$_id',
            count: 1,
          },
        },
      ]);

      const result: Record<IJob['jobStatus'], number> = statuses.reduce(
        (acc, status) => {
          acc[status] = 0;
          return acc;
        },
        {} as Record<IJob['jobStatus'], number>
      );

      stats.forEach(({ jobStatus, count }) => {
        if (jobStatus in result) {
          result[jobStatus as IJob['jobStatus']] = count;
        }
      });

      return {
        success: true,
        stats: result,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch job stats', {
        operation: 'get',
        entityType: 'Job',
      });
    }
  },
  listJobTypesByBranch: async (
    _: unknown,
    args: ListJobTypesArgs,
    { isAuthenticated }: Context
  ): Promise<JobTypeListResult> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');

    try {
      const {
        page = 1,
        limit = 10,
        search,
        branchId,
        franchiseeId,
        name,
        description,
        displayOrder,
        days,
        hours,
        minutes,
      } = args;

      if (!branchId) {
        throw createError.validation('branchId is required');
      }

      const query: JobTypeQuery = { branchId };

      if (franchiseeId) query.franchiseeId = franchiseeId;
      if (name) query.name = { $regex: name, $options: 'i' };
      if (description)
        query.description = { $regex: description, $options: 'i' };
      if (typeof displayOrder === 'number') query.displayOrder = displayOrder;
      if (typeof days === 'number') query.days = days;
      if (typeof hours === 'number') query.hours = hours;
      if (typeof minutes === 'number') query.minutes = minutes;

      // General search across name & description
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      const [jobTypes, total] = await Promise.all([
        JobType.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        JobType.countDocuments(query),
      ]);

      return {
        success: true,
        message: 'Job types fetched successfully',
        jobTypes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to list job types', {
        operation: 'list',
        entityType: 'JobType',
      });
    }
  },
  listJobSourcesByBranch: async (
    _: unknown,
    args: ListJobSourcesArgs,
    { isAuthenticated }: Context
  ): Promise<JobSourceListResult> => {
    if (!isAuthenticated) throw createError.authentication('Not authenticated');
    try {
      const {
        page = 1,
        limit = 10,
        search,
        branchId,
        franchiseeId,
        name,
        description,
        displayOrder,
      } = args;

      if (!branchId) {
        throw createError.validation('branchId is required');
      }
      const query: JobSourceQuery = { branchId };
      if (franchiseeId) query.franchiseeId = franchiseeId;
      if (name) query.name = { $regex: name, $options: 'i' };
      if (description)
        query.description = { $regex: description, $options: 'i' };
      if (typeof displayOrder === 'number') query.displayOrder = displayOrder;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      const [jobSources, total] = await Promise.all([
        JobSource.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        JobSource.countDocuments(query),
      ]);

      return {
        success: true,
        message: 'Job sources fetched successfully',
        jobSources,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to fetch job sources', {
        operation: 'list',
        entityType: 'JobSource',
      });
    }
  },
};
