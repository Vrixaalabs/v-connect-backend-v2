import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IInstituteRole {
  roleId: string;
  instituteId: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstituteRoleSchema = new Schema<IInstituteRole>({
  roleId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  instituteId: {
    type: String,
    required: true,
    ref: 'Institute',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: [{
    type: String,
    required: true,
  }],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User',
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
InstituteRoleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure unique role names per institute
InstituteRoleSchema.index({ instituteId: 1, name: 1 }, { unique: true });

export const InstituteRole = model<IInstituteRole>('InstituteRole', InstituteRoleSchema);
