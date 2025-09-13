import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IOrganizationRole {
  organizationRoleId: string;
  roleId: string;
  organizationId: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationRoleSchema = new Schema<IOrganizationRole>({
  organizationRoleId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  roleId: {
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
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: [
    {
      type: String,
      required: true,
    },
  ],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User',
    refPath: 'userId',
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
OrganizationRoleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure unique role names per organization
OrganizationRoleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const OrganizationRole = model<IOrganizationRole>(
  'OrganizationRole',
  OrganizationRoleSchema
);
