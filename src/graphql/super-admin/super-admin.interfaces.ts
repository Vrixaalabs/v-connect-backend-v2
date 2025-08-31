import { Document } from 'mongoose';
import { IUser } from '../../models/User';
import { IInstitute } from '../../models/Institute';
import { IInstituteUserRole } from '../../models/InstituteUserRole';

// Auth Interfaces
export interface SuperAdminLoginInput {
  email: string;
  password: string;
}

export interface SuperAdmin2FAInput {
  email: string;
  code: string;
}

// Profile Interfaces
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

// Response Interfaces
export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface UserResponse extends BasicResponse {
  user?: IUser & Document;
}

export interface SuperAdminAuthResponse extends BasicResponse {
  token?: string;
  requiresTwoFactor?: boolean;
  user?: IUser & Document;
}

export interface SuperAdminSettingsResponse extends BasicResponse {
  settings?: {
    emailNotifications: boolean;
    twoFactorAuth: boolean;
    maintenanceMode: boolean;
    notifyOnNewInstitute: boolean;
    notifyOnSystemAlerts: boolean;
    notifyOnSecurityAlerts: boolean;
  };
}

export interface InstituteResponse extends BasicResponse {
  institute?: IInstitute & Document;
}

export interface InstituteAdminResponse extends BasicResponse {
  admin?: IInstituteUserRole & Document;
}

export interface InstituteAdminsResponse extends BasicResponse {
  admins: Array<IInstituteUserRole & Document>;
  total: number;
  page: number;
  limit: number;
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
