import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface OrganizationUserRole {
  assignmentId: string;
  organizationId: string;
  userId: string;
  roleId: string;
  departmentId?: string;
  assignedBy: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'pending';
  isPrimary: boolean;
  metadata?: {
    acceptedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationUserRoleSchema = new Schema<OrganizationUserRole>({
  assignmentId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  organizationId: {
    type: String,
    required: true,
    ref: 'Organization',
    refPath: 'organizationId',
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    refPath: 'userId',
  },
  roleId: {
    type: String,
    required: true,
    ref: 'Role',
    refPath: 'roleId',
  },
  departmentId: {
    type: String,
  },
  assignedBy: {
    type: String,
    required: true,
    ref: 'User',
    refPath: 'userId',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  metadata: {
    acceptedAt: {
      type: Date,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to update the updatedAt timestamp
OrganizationUserRoleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure a user can't have multiple active roles in the same organization
OrganizationUserRoleSchema.index(
  { organizationId: 1, userId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const OrganizationUserRole = model<OrganizationUserRole>('OrganizationUserRole', OrganizationUserRoleSchema);
