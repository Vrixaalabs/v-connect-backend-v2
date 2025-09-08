import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  EntityType,
  EntityStatus,
  EntityVisibility,
  IEntitySettings,
  IEntityMetadata,
} from '@/graphql/entity/entity.interfaces';

export interface IEntity extends Document {
  entityId: string;
  name: string;
  type: EntityType;
  description?: string;
  code?: string;
  organizationId?: string;
  parentEntityId?: string;
  status: EntityStatus;
  logo?: string;
  banner?: string;
  settings: IEntitySettings;
  metadata?: IEntityMetadata;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const entitySchema = new Schema<IEntity>(
  {
    entityId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: false,
    },
    organizationId: {
      type: String,
      required: false,
      ref: 'Organization',
      refPath: 'organizationId',
    },
    parentEntityId: {
      type: String,
      ref: 'Entity',
      refPath: 'entityId',
    },
    status: {
      type: String,
      enum: Object.values(EntityStatus),
      default: EntityStatus.ACTIVE,
    },
    logo: {
      type: String,
    },
    banner: {
      type: String,
    },
    settings: {
      allowMembershipRequests: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
      visibility: {
        type: String,
        enum: Object.values(EntityVisibility),
        default: EntityVisibility.ORGANIZATION,
      },
      allowPosts: {
        type: Boolean,
        default: true,
      },
      allowEvents: {
        type: Boolean,
        default: true,
      },
      allowAnnouncements: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalEvents: {
        type: Number,
        default: 0,
      },
      lastActivityAt: {
        type: Date,
      },
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User',
      refPath: 'userId',
    },
    updatedBy: {
      type: String,
      ref: 'User',
      refPath: 'userId',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
// entitySchema.index({ organizationId: 1, type: 1 });
// entitySchema.index({ parentEntityId: 1 });

// Prevent circular parent references
entitySchema.pre(
  'save',
  async function (this: IEntity & { _id: mongoose.Types.ObjectId }, next) {
    const parentId = this.get('parentEntityId');
    if (parentId) {
      let currentParent = parentId;
      const visited = new Set([this.get('entityId')]);

      while (currentParent) {
        if (visited.has(currentParent)) {
          const err = new Error('Circular parent reference detected');
          return next(err);
        }
        visited.add(currentParent);

        const parent = await Entity.findOne(
          { entityId: currentParent },
          'parentEntityId'
        );
        currentParent = parent?.get('parentEntityId') || '';
      }
    }
    next();
  }
);

// Update metadata
entitySchema.pre(
  'save',
  function (this: IEntity & { _id: mongoose.Types.ObjectId }, next) {
    const metadata = this.get('metadata');
    if (metadata) {
      this.set('metadata', {
        totalMembers: metadata.totalMembers || 0,
        totalPosts: metadata.totalPosts || 0,
        totalEvents: metadata.totalEvents || 0,
        lastActivityAt: new Date(),
      });
    }
    next();
  }
);

export const Entity = mongoose.model<IEntity>('Entity', entitySchema);
