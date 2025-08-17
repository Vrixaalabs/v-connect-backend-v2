import { IAddress } from '@/types/types';
import { Document } from 'mongoose';

export type BranchType = 'main' | 'sub';
export type BranchStatus = 'active' | 'inactive' | 'closed';

export interface BranchContact {
  phone?: string;
  email?: string;
  managerName?: string;
}

export interface DayHours {
  open?: string;
  close?: string;
  isOpen: boolean;
}

export interface BranchOperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface BranchSettings {
  timezone?: string;
  currency?: string;
  taxRate?: number;
}

export interface BranchMetadata {
  openingDate?: Date;
  renovationDates?: Date[];
  lastInspectionDate?: Date;
}

export interface BranchAddress {
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

export interface CreateBranchInput {
  name: string;
  code: string;
  type?: BranchType;
  status?: BranchStatus;
  address: BranchAddress;
  contact?: BranchContact;
  operatingHours?: BranchOperatingHours;
  settings?: BranchSettings;
  metadata?: BranchMetadata;
}

export interface UpdateBranchInput {
  name?: string;
  code?: string;
  type?: BranchType;
  status?: BranchStatus;
  address?: IAddress;
  contact?: BranchContact;
  operatingHours?: BranchOperatingHours;
  settings?: BranchSettings;
  metadata?: BranchMetadata;
}

export interface BranchResponse {
  success: boolean;
  message: string;
  branch: Branch | null;
}

export interface DeleteBranchResponse {
  success: boolean;
  message: string;
}

export interface BranchListResponse {
  success: boolean;
  message: string;
  branches: Branch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListBranchesArgs {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
  type?: 'main' | 'sub';
  status?: 'active' | 'inactive' | 'closed';
  phone?: string;
  email?: string;
  managerName?: string;
  timezone?: string;
}

export interface GetBranchArgs {
  branchId: string;
}

export interface Branch {
  branchId: string;
  franchiseeId: string;
  name: string;
  code: string;
  type: BranchType;
  status: BranchStatus;
  addressId: string;
  contact?: BranchContact;
  operatingHours?: BranchOperatingHours;
  settings?: BranchSettings;
  metadata?: BranchMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchDocument extends Branch, Document {}
