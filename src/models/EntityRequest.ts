import { Schema, SchemaType, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IEntityRequestMetadata {
  fullName: string;
  email: string;
  rollNumber: string;
  type: string;
  departmentId?: string;
  batch: string;
  message?: string;
}

export interface IEntityRequest extends Document {
  entityRequestId: string;
  entityId: string;
  userId: string;
  status: string;
  metadata?: IEntityRequestMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const entityRequestSchema = new Schema<IEntityRequest>({
  entityRequestId: {
    type: String,
    required: true,
    default: uuidv4,
    unique: true,
  },
  entityId: {
    type: String,
    ref: 'Entity',
    refPath: 'entityId',
    required: true,
    get: (v: string) => v,
    set: (v: string) => v,
  },
  userId: {
    type: String,
    ref: 'User',
    refPath: 'userId',
    required: true,
    get: (v: string) => v,
    set: (v: string) => v,
  },
  metadata: {
    type: Object as unknown as SchemaType<IEntityRequestMetadata>,
    required: false,
    default: {
      fullName: '',
      email: '',
      rollNumber: '',
      type: '',
      batch: '',
      message: '',
    },
  },
  status: {
    type: String,
    required: true,
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

export const EntityRequest = model('EntityRequest', entityRequestSchema);
