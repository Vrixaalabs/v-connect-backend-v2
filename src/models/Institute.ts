import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstitute {
  instituteId: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  coverImage?: string;
  website?: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  departments: IDepartment[];
  followers: string[]; // Array of userIds
  studentsCount: number;
  followersCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
  id: {
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
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const InstituteSchema = new Schema<IInstitute>({
  instituteId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  logo: String,
  banner: String,
  coverImage: String,
  website: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    line1: {
      type: String,
      required: true,
    },
    line2: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
  },
  departments: [DepartmentSchema],
  followers: [{
    type: String,
    ref: 'User',
  }],
  studentsCount: {
    type: Number,
    default: 0,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
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
InstituteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create slug from name
InstituteSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  next();
});

export const Institute = model<IInstitute>('Institute', InstituteSchema);
