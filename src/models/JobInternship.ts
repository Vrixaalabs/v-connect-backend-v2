import mongoose, { Document, Schema } from 'mongoose';

export interface IJobInternship extends Document {
  title: string;
  organization: string;
  description?: string;
  role: string;
  link: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobInternshipSchema = new Schema<IJobInternship>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      ref: 'User',
    },
    link: {
      type: String,
      required: true,
      ref: 'User',
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const JobInternship = mongoose.model<IJobInternship>(
  'JobInternship',
  jobInternshipSchema 
);
