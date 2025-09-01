import mongoose, { Document, Schema } from 'mongoose';

export type FriendConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface IFriendConnection extends Document {
  requesterUserId: string;
  recipientUserId: string;
  status: FriendConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
}

const friendConnectionSchema = new Schema<IFriendConnection>(
  {
    requesterUserId: { type: String, required: true, index: true },
    recipientUserId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
      index: true,
    },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

friendConnectionSchema.index({ requesterUserId: 1, recipientUserId: 1 }, { unique: true });
friendConnectionSchema.index({ status: 1, updatedAt: -1 });

export const FriendConnection = mongoose.model<IFriendConnection>(
  'FriendConnection',
  friendConnectionSchema
);
