// models/Event.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isVirtual: boolean;
  link?: string; // for online events
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },

    startDate: { type: Date, required: true },
    endDate: { type: Date },

    location: {
      name: { type: String },
      address: { type: String },
      city: { type: String },
      country: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    isVirtual: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model<IEvent>("Event", EventSchema);
