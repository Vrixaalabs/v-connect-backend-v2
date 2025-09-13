import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface OrganizationJoinRequest {
  requestId: string;
  organizationId: string;
  userId: string;
  fullName: string;
  email: string;
  rollNumber: string;
  departmentId: string;
  batch: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationJoinRequestSchema = new Schema<OrganizationJoinRequest>({
  requestId: {
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
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
  },
  departmentId: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: String,
    ref: 'User',
    refPath: 'userId',
  },
  rejectionReason: String,
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
OrganizationJoinRequestSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// eslint-disable-next-line
export const OrganizationJoinRequest = model<OrganizationJoinRequest>(
  'OrganizationJoinRequest',
  OrganizationJoinRequestSchema
);
