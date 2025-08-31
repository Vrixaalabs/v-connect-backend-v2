import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IInstituteJoinRequest {
  requestId: string;
  instituteId: string;
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

const InstituteJoinRequestSchema = new Schema<IInstituteJoinRequest>({
  requestId: {
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
InstituteJoinRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const InstituteJoinRequest = model<IInstituteJoinRequest>('InstituteJoinRequest', InstituteJoinRequestSchema);
