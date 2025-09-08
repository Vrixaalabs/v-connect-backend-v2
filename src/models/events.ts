import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IEvent extends Document {
  eventId: string;
  title: string;
  description?: string;
  coverImage?: string;
   
  location?: {
    venue?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isOnline?: boolean;
    meetingLink?: string;
  };
  
   
  startDate: Date;
  endDate: Date;
  timezone?: string;
  eventType: 'conference' | 'workshop' | 'seminar' | 'meeting' | 'social' | 'competition' | 'other';
  category?: string;
  tags?: string[];
  
  
  maxAttendees?: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  registrationFee?: number;
  currency?: string;
  

  visibility: 'public' | 'private' | 'organization' | 'invite-only';
  requiresApproval: boolean;
  
  
  agenda?: {
    time: string;
    title: string;
    description?: string;
    speaker?: string;
  }[];
  attachments?: string[];
  
 
  entity: mongoose.Types.ObjectId;     
  createdBy: mongoose.Types.ObjectId;  
  verifiedBy?: mongoose.Types.ObjectId; 
  organizers?: mongoose.Types.ObjectId[];
  
  
  attendees: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  waitlist?: mongoose.Types.ObjectId[];
  invitees?: mongoose.Types.ObjectId[];
  

  posts: mongoose.Types.ObjectId[];
  announcements?: mongoose.Types.ObjectId[];
  
 
  parentEvent?: mongoose.Types.ObjectId;
  subEvents: mongoose.Types.ObjectId[];
  
   
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  isVerified: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  
   
  viewCount?: number;
  shareCount?: number;
  
 
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    eventId: { type: String, required: true, unique: true, default: uuidv4 },
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    
    
    location: {
      venue: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      isOnline: { type: Boolean, default: false },
      meetingLink: { type: String }
    },
    
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    eventType: { 
      type: String, 
      enum: ['conference', 'workshop', 'seminar', 'meeting', 'social', 'competition', 'other'],
      required: true,
      default: 'other'
    },
    category: { type: String },
    tags: [{ type: String }],
    
   
    maxAttendees: { type: Number },
    registrationRequired: { type: Boolean, default: false },
    registrationDeadline: { type: Date },
    registrationFee: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    
    
    visibility: { 
      type: String, 
      enum: ['public', 'private', 'organization', 'invite-only'],
      default: 'public'
    },
    requiresApproval: { type: Boolean, default: false },
    
  
    agenda: [{
      time: { type: String },
      title: { type: String },
      description: { type: String },
      speaker: { type: String }
    }],
    attachments: [{ type: String }],
    
    
    entity: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    organizers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    waitlist: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    invitees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    
    posts: [{ type: Schema.Types.ObjectId, ref: 'EventPost' }],
    announcements: [{ type: Schema.Types.ObjectId, ref: 'Announcement' }],
    
    parentEvent: { type: Schema.Types.ObjectId, ref: 'Event' },
    subEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    
     
    status: { 
      type: String, 
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled', 'postponed'],
      default: 'draft'
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    
    
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

// Pre-save hook to update lastActivityAt in the entity metadata
EventSchema.pre('save', async function (next) {
  if (this.isModified()) {
    await mongoose.model('Entity').findByIdAndUpdate(this.entity, {
      $set: { 'metadata.lastActivityAt': new Date() },
    });
  }
  next();
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
