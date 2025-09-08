import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export interface IInstitute extends Document {
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
  departmentCount: number;
  followers: string[]; // Array of userIds
  studentsCount: number;
  followersCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  departmentCount: {
    type: Number,
    default: 0,
  },
  followers: [
    {
      type: String,
      ref: 'User',
    },
  ],
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

// Pre-save middleware to update timestamps and counts
InstituteSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  next();
});

// Create slug from name
InstituteSchema.pre('save', function (next) {
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
