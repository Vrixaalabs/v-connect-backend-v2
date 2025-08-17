import { IJob, IJobSource, IJobType } from '@/types/types';
import { FilterQuery } from 'mongoose';

export interface Context {
  isAuthenticated: boolean;
}

export interface JobItemInput {
  item: string;
  qty: number;
  price: number;
  cost: number;
  amount: number;
  taxable: boolean;
}

export interface PaymentInput {
  amount: number;
  paymentType: string;
}

export interface ScheduleInput {
  startTime: Date;
  endTime: Date;
}

export interface JobClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone: string;
  companyName: string;
  adSource: string;
  allowBilling: boolean;
  taxExempt: boolean;
}

export interface JobAddress {
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  map: {
    latitude: number;
    longitude: number;
  };
  isPrimary: boolean;
  type: string;
}

export interface CreateJobArgs {
  clientId?: string;
  branchId: string;
  jobTypeId: string;
  jobSourceId: string;
  description?: string;
  techId: string;
  schedule: ScheduleInput;
  jobItems?: JobItemInput[];
  payments?: PaymentInput[];
  jobStatus:
    | 'SUBMITTED'
    | 'IN_PROGRESS'
    | 'CANCELLED'
    | 'DONE'
    | 'PENDING'
    | 'DONE_PENDING_APPROVAL';
  tags?: string[];
  client: JobClient;
  address: JobAddress;
}

export interface UpdateJobArgs extends Partial<CreateJobArgs> {
  jobId: string;
}

export interface JobResult {
  success: boolean;
  message: string;
  job?: IJob;
}

export type JobStatus =
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'CANCELLED'
  | 'DONE'
  | 'PENDING'
  | 'DONE_PENDING_APPROVAL';

export interface JobQuery {
  clientId?: string;
  jobStatus?: JobStatus;
  description?: { $regex: string; $options: string };
  tags?: { $in: RegExp[] };
  $or?: Array<{
    description?: { $regex: string; $options: string };
    tags?: { $in: RegExp[] };
  }>;
}

export interface ListJobsArgs {
  page?: number;
  limit?: number;
  jobNumber?: number;
  jobTypeId?: string;
  jobSourceId?: string;
  techId?: string;
  jobStatus?:
    | 'SUBMITTED'
    | 'IN_PROGRESS'
    | 'CANCELLED'
    | 'DONE'
    | 'PENDING'
    | 'DONE_PENDING_APPROVAL';
  tags?: string[];
  startDate?: string; // schedule.startTime >=
  endDate?: string; // schedule.startTime <=
  search?: string; // description/tags partial search
  branchId: string;
}

export interface GetJobByIdArgs {
  id: string;
}

export interface JobListResult {
  success: boolean;
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  jobs: IJob[];
}

export interface GetJobByJobIdResult {
  success: boolean;
  job: IJob;
}

export interface JobStats {
  SUBMITTED: number;
  IN_PROGRESS: number;
  CANCELLED: number;
  DONE: number;
  PENDING: number;
  DONE_PENDING_APPROVAL: number;
}

export interface JobStatsResult {
  success: boolean;
  stats: JobStats;
}

export interface ListJobTypesArgs {
  page?: number;
  limit?: number;
  search?: string;

  branchId: string; // required
  franchiseeId?: string;
  name?: string;
  description?: string;
  displayOrder?: number;
  days?: number;
  hours?: number;
  minutes?: number;
}

export type JobTypeQuery = FilterQuery<IJobType> & {
  branchId: string;
};

export interface JobTypeListResult {
  success: boolean;
  message: string;
  jobTypes: IJobType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// export interface JobTypeQuery {
//   name?: { $regex: string; $options: string };
// }

export interface CreateJobTypeArgs {
  branchId: string;
  franchiseeId: string;
  name: string;
  description: string;
  displayOrder: number;
  days: number;
  hours: number;
  minutes: number;
}

export interface JobTypeResult {
  success: boolean;
  message: string;
  jobType?: IJobType;
}

export interface ListJobSourcesArgs {
  page?: number;
  limit?: number;
  search?: string;
  branchId: string;
  franchiseeId?: string;
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface JobSourceListResult {
  success: boolean;
  message: string;
  jobSources: IJobSource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type JobSourceQuery = FilterQuery<IJobType> & {
  branchId: string;
};

export interface CreateJobSourceArgs {
  name: string;
  description: string;
  displayOrder: number;
}

export interface JobSourceResult {
  success: boolean;
  message: string;
  jobSource?: IJobSource;
}
