import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IAMASession extends Document {
  amaSessionId: string;
  title: string;
  description?: string;
  hostUserId: string; // references User.userId
  tags?: string[];
  scheduledAt: Date;
  endedAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const amaSessionSchema = new Schema<IAMASession>(
  {
    amaSessionId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
    },
    hostUserId: {
      type: String,
      required: true,
      ref: 'User',
    },
    tags: {
      type: [String],
      default: [],
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AMASession = mongoose.model<IAMASession>(
  'AMASession',
  amaSessionSchema
);
