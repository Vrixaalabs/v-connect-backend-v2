import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/app.config';
import { Organization, IOrganization } from './Organization';
import { IRole, Role } from './Role';
import {
  OrganizationUserRole as OrganizationUserRoleModel,
  OrganizationUserRole,
} from './OrganizationUserRole';

export interface IUser extends Document {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  type: 'student' | 'faculty' | 'alumni';
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'super_admin';
  lastLoginAt?: Date;
  fullName?: string;
  verificationToken?: string;
  isVerified?: boolean;
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
  settings?: {
    emailNotifications: boolean;
    twoFactorAuth: boolean;
    maintenanceMode: boolean;
    notifyOnNewInstitute: boolean;
    notifyOnSystemAlerts: boolean;
    notifyOnSecurityAlerts: boolean;
    twoFactorCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getOrganizations(): Promise<
    Array<{
      organization: IOrganization;
      role: IRole;
      status: string;
      isPrimary: boolean;
    }>
  >;
  getPrimaryOrganization(): Promise<{
    organization: IOrganization;
    role: IRole;
    status: string;
  } | null>;
  hasRole(organizationId: string, roleName: string): Promise<boolean>;
  addToOrganization(
    organizationId: string,
    roleId: string,
    isPrimary?: boolean
  ): Promise<OrganizationUserRole>;
  removeFromOrganization(organizationId: string): Promise<void>;
  getPermissionsForOrganization(organizationId: string): Promise<
    Array<{
      resource: string;
      actions: string[];
    }>
  >;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email',
      ],
    },
    verificationToken: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['student', 'faculty', 'alumni'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },
    lastLoginAt: {
      type: Date,
    },
    fullName: {
      type: String,
      required: false,
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      notifyOnNewInstitute: {
        type: Boolean,
        default: true,
      },
      notifyOnSystemAlerts: {
        type: Boolean,
        default: true,
      },
      notifyOnSecurityAlerts: {
        type: Boolean,
        default: true,
      },
      twoFactorCode: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    // Use higher number of rounds for super admin
    const rounds =
      this.role === 'super_admin'
        ? 12
        : (config.jwt.bcryptRounds as number) || 10;

    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get all organizations for the user with their roles
userSchema.methods.getOrganizations = async function (): Promise<
  Array<{
    organization: IOrganization;
    role: IRole;
    status: string;
    isPrimary: boolean;
  }>
> {
  const memberships = await OrganizationUserRole.find({
    userId: this.userId,
  })
    .populate({
      path: 'organizationId',
      model: 'Organization',
      select: 'organizationId name status',
    })
    .populate({
      path: 'roleId',
      model: 'Role',
      select: 'roleId name permissions',
    })
    .sort({ isPrimary: -1, createdAt: -1 });

  return memberships.map(membership => {
    const typedMembership = membership as unknown as OrganizationUserRole & {
      organizationId: IOrganization;
      roleId: IRole;
    };

    return {
      organization: typedMembership.organizationId,
      role: typedMembership.roleId,
      status: typedMembership.status,
      isPrimary: typedMembership.isPrimary,
    };
  });
};

// Get user's primary organization
userSchema.methods.getPrimaryOrganization = async function (): Promise<{
  organization: IOrganization;
  role: IRole;
  status: string;
} | null> {
  const membership = await OrganizationUserRoleModel.findOne({
    userId: this.userId,
    isPrimary: true,
  })
    .populate({
      path: 'organizationId',
      model: 'Organization',
      select: 'franchiseeId name status',
    })
    .populate({
      path: 'roleId',
      model: 'Role',
      select: 'roleId name permissions',
    });

  if (!membership) return null;

  const typedMembership = membership as unknown as OrganizationUserRole & {
    organizationId: IOrganization;
    roleId: IRole;
  };

  return {
    organization: typedMembership.organizationId,
    role: typedMembership.roleId,
    status: typedMembership.status,
  };
};

// Check if user has a specific role in a organization
userSchema.methods.hasRole = async function (
  organizationId: string,
  roleName: string
): Promise<boolean> {
  const membership = await OrganizationUserRoleModel.findOne({
    userId: this.userId,
    organizationId,
    status: 'active',
  }).populate({
    path: 'roleId',
    model: 'Role',
    select: 'roleId name permissions',
  });

  if (!membership) return false;
  return (membership.roleId as unknown as IRole).name === roleName;
};

// Add user to a franchisee with a role
userSchema.methods.addToOrganization = async function (
  organizationId: string,
  roleId: string,
  isPrimary: boolean = false
): Promise<OrganizationUserRole> {
  // Check if franchisee and role exist
  const [organization, role] = await Promise.all([
    Organization.findOne({ organizationId }),
    Role.findOne({ roleId }),
  ]);

  if (!organization || !role) {
    throw new Error('Organization or role not found');
  }

  // Create or update the membership
  const membership = await OrganizationUserRoleModel.findOneAndUpdate(
    {
      userId: this.userId,
      organizationId,
    },
    {
      roleId,
      isPrimary,
      status: 'active' as const,
      isActive: true,
      assignedBy: this.userId, // Using current user as assigner
      $setOnInsert: {
        metadata: {
          acceptedAt: new Date(),
        },
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true, // Ensure schema validation runs on update
    }
  );

  if (!membership) {
    throw new Error('Failed to create or update organization membership');
  }

  return membership;
};

// Remove user from a franchisee
userSchema.methods.removeFromOrganization = async function (
  organizationId: string
): Promise<void> {
  await OrganizationUserRoleModel.deleteOne({
    userId: this.userId,
    organizationId,
  });
};

// Get user's permissions for a specific franchisee
userSchema.methods.getPermissionsForOrganization = async function (
  organizationId: string
): Promise<
  Array<{
    resource: string;
    actions: string[];
  }>
> {
  const membership = await OrganizationUserRoleModel.findOne({
    userId: this.userId,
    organizationId,
    status: 'active',
  }).populate({
    path: 'roleId',
    model: 'Role',
    select: 'roleId name permissions',
  });

  if (!membership) return [];

  const role = membership.roleId as unknown as IRole;
  return role.permissions;
};

export const User = mongoose.model<IUser>('User', userSchema);
