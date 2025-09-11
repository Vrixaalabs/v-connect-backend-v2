import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '@/graphql/entity/entity.interfaces';

export interface IEntityUserRole extends Document {
  entityUserId: string;
  entityId: string;
  userId: string;
  roleId: string;
  joinedAt: Date;
  status: UserStatus;
}

const entityUserRoleSchema = new Schema<IEntityUserRole>({
  entityUserId: {
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
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  },
});

// Create indexes for better query performance
entityUserRoleSchema.index({ entityId: 1, userId: 1 }, { unique: true });
entityUserRoleSchema.index({ userId: 1 });
entityUserRoleSchema.index({ roleId: 1 });

export const EntityUserRole = mongoose.model<IEntityUserRole>(
  'EntityUserRole',
  entityUserRoleSchema
);
