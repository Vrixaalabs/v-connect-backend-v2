import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/app.config';

export interface IOrganization extends Document {
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  addressId: string;
  logo?: string;
  banner?: string;
  coverImage?: string;
  website?: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>({
  organizationId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
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
  logo: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addressId: {
    type: String,
    required: true,
    ref: 'Address',
    refPath: 'addressId',
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User',
    refPath: 'userId',
  },
  updatedBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);