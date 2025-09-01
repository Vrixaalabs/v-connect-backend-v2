import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolioEntry {
  title: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export interface IFriendProfile extends Document {
  userId: string; // references User.userId
  name?: string;
  avatar?: string;
  bio?: string;
  department?: string;
  degree?: string;
  graduationYear?: number;
  linkedin?: string;
  github?: string;
  portfolio?: IPortfolioEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const portfolioEntrySchema = new Schema<IPortfolioEntry>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 1000 },
    link: { type: String },
    technologies: [{ type: String }],
  },
  { _id: false }
);

const friendProfileSchema = new Schema<IFriendProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    department: { type: String, index: true },
    degree: { type: String, index: true },
    graduationYear: { type: Number, index: true },
    linkedin: { type: String },
    github: { type: String },
    portfolio: [portfolioEntrySchema],
  },
  { timestamps: true }
);

export const FriendProfile = mongoose.model<IFriendProfile>('FriendProfile', friendProfileSchema);
