import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IEntity extends Document {
  entityId: string;
  name: string;
  type: 'club' | 'department' | 'committee' | 'team';
  description?: string;
  organizationId: string;
  parentEntityId?: string;
  status: 'active' | 'inactive' | 'archived';
  logo?: string;
  banner?: string;
  members?: {
    userId: string;
    role: string;
    joinedAt: Date;
    status: 'active' | 'inactive';
  }[];
  settings?: {
    allowMembershipRequests: boolean;
    requireApproval: boolean;
    visibility: 'public' | 'private' | 'organization';
    allowPosts: boolean;
    allowEvents: boolean;
    allowAnnouncements: boolean;
  };
  metadata?: {
    totalMembers: number;
    totalPosts: number;
    totalEvents: number;
    lastActivityAt?: Date;
  };
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
      enum: ['club', 'department', 'committee', 'team'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    organizationId: {
      type: String,
      required: true,
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
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    logo: {
      type: String,
    },
    banner: {
      type: String,
    },
    members: [{
      userId: {
        type: String,
        required: true,
        ref: 'User',
        refPath: 'userId',
      },
      role: {
        type: String,
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
    }],
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
        enum: ['public', 'private', 'organization'],
        default: 'organization',
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
entitySchema.index({ organizationId: 1, type: 1 });
entitySchema.index({ parentEntityId: 1 });
entitySchema.index({ 'members.userId': 1 });
entitySchema.index({ status: 1 });

// Prevent circular parent references
entitySchema.pre('save', async function(next) {
  if (this.parentEntityId) {
    let currentParent = this.parentEntityId;
    const visited = new Set([this.entityId]);

    while (currentParent) {
      if (visited.has(currentParent)) {
        const err = new Error('Circular parent reference detected');
        return next(err);
      }
      visited.add(currentParent);

      const parent = await Entity.findOne({ entityId: currentParent }, 'parentEntityId');
      currentParent = parent?.parentEntityId || '';
    }
  }
  next();
});

// Update metadata
entitySchema.pre('save', function(next) {
  if (this.members) {
    this.metadata = {
      ...this.metadata,
      totalPosts: this.metadata?.totalPosts || 0,
      totalEvents: this.metadata?.totalEvents || 0,
      totalMembers: this.members.filter(m => m.status === 'active').length,
      lastActivityAt: new Date(),
    };
  }
  next();
});

export const Entity = mongoose.model<IEntity>('Entity', entitySchema);
