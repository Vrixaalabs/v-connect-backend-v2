import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFriendConnection extends Document {
  connectionId: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  initiatedBy: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  blockedAt?: Date;
  blockedBy?: string;
  metadata?: {
    lastInteractionAt?: Date;
    mutualFriends?: number;
    commonGroups?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const friendConnectionSchema = new Schema<IFriendConnection>(
  {
    connectionId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
      refPath: 'userId',
    },
    friendId: {
      type: String,
      required: true,
      ref: 'User',
      refPath: 'userId',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    initiatedBy: {
      type: String,
      required: true,
      ref: 'User',
      refPath: 'userId',
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    blockedAt: {
      type: Date,
    },
    blockedBy: {
      type: String,
      ref: 'User',
      refPath: 'userId',
    },
    metadata: {
      lastInteractionAt: {
        type: Date,
      },
      mutualFriends: {
        type: Number,
        default: 0,
      },
      commonGroups: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique connections between users
friendConnectionSchema.index({ userId: 1, friendId: 1 }, { unique: true });

// Prevent self-connections
friendConnectionSchema.pre('save', function (next) {
  if (this.userId === this.friendId) {
    const err = new Error('Cannot create friend connection with self');
    return next(err);
  }
  next();
});

// Update metadata timestamps based on status changes
friendConnectionSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    switch (this.status) {
      case 'accepted':
        this.acceptedAt = new Date();
        break;
      case 'rejected':
        this.rejectedAt = new Date();
        break;
      case 'blocked':
        this.blockedAt = new Date();
        break;
    }
  }
  next();
});

export const FriendConnection = mongoose.model<IFriendConnection>(
  'FriendConnection',
  friendConnectionSchema
);
