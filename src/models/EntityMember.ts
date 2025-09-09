import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { MemberStatus } from '@/graphql/entity/entity.interfaces';

export interface IEntityMember extends Document {
  entityMemberId: string;
  entityId: string;
  userId: string;
  roleId: string;
  joinedAt: Date;
  status: MemberStatus;
}

const entityMemberSchema = new Schema<IEntityMember>({
  entityMemberId: {
    type: String,
    required: true,
    default: uuidv4,
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
  roleId: {
    type: String,
    required: true,
    ref: 'Role',
    refPath: 'roleId',
    get: (v: string) => v,
    set: (v: string) => v,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: Object.values(MemberStatus),
    default: MemberStatus.ACTIVE,
  },
});

// Create indexes for better query performance
entityMemberSchema.index({ entityId: 1, userId: 1 }, { unique: true });
entityMemberSchema.index({ userId: 1 });
entityMemberSchema.index({ roleId: 1 });

export const EntityMember = mongoose.model<IEntityMember>(
  'EntityMember',
  entityMemberSchema
);
