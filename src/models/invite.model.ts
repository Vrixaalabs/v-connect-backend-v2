import { IInvite } from '@/types/types';
import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const inviteSchema = new Schema<IInvite>(
  {
    inviteId: {
      type: String,
      required: true,
      default: () => uuidv4(),
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    entityId: {
      type: String,
      required: true,
      ref: 'Entity',
      refPath: 'entityId',
      get: (v: string) => v,
      set: (v: string) => v,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
      refPath: 'userId',
      get: (v: string) => v,
      set: (v: string) => v,
    },
    role: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const InviteModel = model<IInvite>('Invite', inviteSchema);
