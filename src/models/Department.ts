import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDepartment extends Document {
  departmentId: string;
  name: string;
  code: string;
  description?: string;
  instituteId: string;
  studentsCount: number;
  facultyCount: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
  departmentId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  instituteId: {
    type: String,
    ref: 'Institute',
    required: true,
  },
  studentsCount: {
    type: Number,
    default: 0,
  },
  facultyCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    ref: 'User',
  },
  updatedBy: {
    type: String,
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
DepartmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create compound index for instituteId and code to ensure unique codes per institute
DepartmentSchema.index({ instituteId: 1, code: 1 }, { unique: true });

// Create compound index for instituteId and name to ensure unique names per institute
DepartmentSchema.index({ instituteId: 1, name: 1 }, { unique: true });

export const Department = model<IDepartment>('Department', DepartmentSchema);
