import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IInstituteUserRole {
  assignmentId: string;
  instituteId: string;
  userId: string;
  roleId: string;
  departmentId?: string;
  assignedBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstituteUserRoleSchema = new Schema<IInstituteUserRole>({
  assignmentId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  instituteId: {
    type: String,
    required: true,
    ref: 'Institute',
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  roleId: {
    type: String,
    required: true,
    ref: 'InstituteRole',
  },
  departmentId: {
    type: String,
  },
  assignedBy: {
    type: String,
    required: true,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
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
InstituteUserRoleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure a user can't have multiple active roles in the same institute
InstituteUserRoleSchema.index(
  { instituteId: 1, userId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const InstituteUserRole = model<IInstituteUserRole>('InstituteUserRole', InstituteUserRoleSchema);
