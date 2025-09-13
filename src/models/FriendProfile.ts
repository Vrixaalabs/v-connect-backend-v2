import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFriendProfile extends Document {
  profileId: string;
  userId: string;
  visibility: 'public' | 'friends' | 'private';
  bio?: string;
  interests?: string[];
  education?: {
    institute: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
    current: boolean;
  }[];
  experience?: {
    company: string;
    position: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }[];
  skills?: string[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  achievements?: {
    title: string;
    description: string;
    date: Date;
    url?: string;
  }[];
  stats?: {
    totalFriends: number;
    mutualFriends: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
  };
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const friendProfileSchema = new Schema<IFriendProfile>(
  {
    profileId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: 'User',
      refPath: 'userId',
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [
      {
        institute: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        field: {
          type: String,
          required: true,
        },
        startYear: {
          type: Number,
          required: true,
        },
        endYear: {
          type: Number,
        },
        current: {
          type: Boolean,
          default: false,
        },
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    socialLinks: [
      {
        platform: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    achievements: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        url: {
          type: String,
        },
      },
    ],
    stats: {
      totalFriends: {
        type: Number,
        default: 0,
      },
      mutualFriends: {
        type: Number,
        default: 0,
      },
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalLikes: {
        type: Number,
        default: 0,
      },
      totalComments: {
        type: Number,
        default: 0,
      },
    },
    lastActive: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
friendProfileSchema.index({ userId: 1 });
friendProfileSchema.index({ 'education.institute': 1 });
friendProfileSchema.index({ 'experience.company': 1 });
friendProfileSchema.index({ skills: 1 });
friendProfileSchema.index({ interests: 1 });

// Auto-update lastActive
friendProfileSchema.pre('save', function (next) {
  this.lastActive = new Date();
  next();
});

export const FriendProfile = mongoose.model<IFriendProfile>(
  'FriendProfile',
  friendProfileSchema
);
