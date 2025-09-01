import { Document } from 'mongoose';
import { IUser } from '../../models/User';
import { IInstitute } from '../../models/Institute';
import { IInstituteUserRole } from '../../models/InstituteUserRole';

// Base Response Interface
export interface BaseResponse {
  success: boolean;
  message: string;
}

// Auth Types
export interface SuperAdminLoginInput {
  email: string;
  password: string;
}

export interface SuperAdmin2FAInput {
  email: string;
  code: string;
}

// Profile Types
export interface UpdateSuperAdminProfileInput {
  fullName: string;
  email: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSuperAdminSettingsInput {
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  maintenanceMode: boolean;
  notifyOnNewInstitute: boolean;
  notifyOnSystemAlerts: boolean;
  notifyOnSecurityAlerts: boolean;
}

// Request Args Types
export interface SuperAdminLoginArgs {
  email: string;
  password: string;
}

export interface SuperAdmin2FAArgs {
  email: string;
  code: string;
}

export interface UpdateSuperAdminProfileArgs {
  input: UpdateSuperAdminProfileInput;
}

export interface UpdatePasswordArgs {
  input: UpdatePasswordInput;
}

export interface UpdateSuperAdminSettingsArgs {
  input: UpdateSuperAdminSettingsInput;
}

// Response Types
// User Response Types
export interface UserData {
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse extends BaseResponse {
  user?: UserData;
}

export interface SuperAdminAuthResponse extends BaseResponse {
  token?: string;
  requiresTwoFactor?: boolean;
  user?: UserData;
}

export interface SuperAdminSettings {
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  maintenanceMode: boolean;
  notifyOnNewInstitute: boolean;
  notifyOnSystemAlerts: boolean;
  notifyOnSecurityAlerts: boolean;
}

export interface SuperAdminSettingsResponse extends BaseResponse {
  settings: SuperAdminSettings;
}

export interface InstituteResponse extends BaseResponse {
  institute?: IInstitute & Document;
}

export interface InstituteAdminResponse extends BaseResponse {
  admin?: IInstituteUserRole & Document;
}

export interface InstituteAdminsResponse extends BaseResponse {
  admins: Array<IInstituteUserRole & Document>;
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStatsResponse extends BaseResponse {
  stats: {
    totalInstitutes: number;
    totalStudents: number;
    totalDepartments: number;
    activeAdmins: number;
  };
}

export interface RecentActivitiesResponse extends BaseResponse {
  activities: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    instituteId?: string;
    userId?: string;
  }>;
}

export interface SystemStatusResponse extends BaseResponse {
  status: {
    status: string;
    load: number;
    lastUpdated: string;
  };
}

// Dashboard Interfaces
export interface SuperAdminDashboardStats {
  totalInstitutes: number;
  totalStudents: number;
  totalDepartments: number;
  activeAdmins: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  instituteId?: string;
  userId?: string;
}

export interface SystemStatus {
  status: string;
  load: number;
  lastUpdated: string;
}

// Query Interfaces
export interface GetInstituteAdminsArgs {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetRecentActivitiesArgs {
  limit?: number;
}

// Mutation Interfaces
export interface AssignAdminInput {
  email: string;
  instituteId: string;
}

export interface UpdateInstituteArgs {
  instituteId: string;
  input: {
    name?: string;
    description?: string;
    location?: string;
    website?: string;
    isActive?: boolean;
  };
}

export interface RemoveAdminArgs {
  adminId: string;
}
