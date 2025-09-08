import mongoose, { Document, Schema } from 'mongoose';

export type ActivityCategory =
  | 'DRAMA'
  | 'MUSIC'
  | 'SHOOTING'
  | 'ENTREPRENEURSHIP'
  | 'SPORTS'
  | 'DANCE'
  | 'INDOOR GAMES'
  | 'OTHER';

export interface IActivityRequest extends Document {
  title: string;
  description: string;
  category: ActivityCategory;
  createdByUserId: string; // references User.userId
  responses: string[]; // array of userIds
  responseLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const activityRequestSchema = new Schema<IActivityRequest>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 4000 },
    category: {
      type: String,
      enum: [
        'DRAMA',
        'MUSIC',
        'SHOOTING',
        'ENTREPRENEURSHIP',
        'SPORTS',
        'DANCE',
        'INDOOR GAMES',
        'OTHER',
      ],
      default: 'OTHER',
      index: true,
    },
    createdByUserId: { type: String, required: true, index: true },
    responses: [{ type: String, index: true }],

    responseLimit: { type: Number, required: true, default: 10, min: 1 },
  },
  { timestamps: true }
);

activityRequestSchema.index({ category: 1, createdAt: -1 });
activityRequestSchema.index({ createdByUserId: 1, createdAt: -1 });

export const ActivityRequest = mongoose.model<IActivityRequest>(
  'ActivityRequest',
  activityRequestSchema
);
