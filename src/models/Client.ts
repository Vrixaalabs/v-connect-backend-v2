import { IClient } from '@/types/types';
import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const clientSchema = new Schema<IClient>(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => uuidv4(),
    },
    branchId: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      // required: true,
      unique: false,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
      default: null,
      required: false,
    },
    phone: {
      type: String,
      required: true,
      unique: true, // enforce unique phone numbers
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    altPhone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    companyName: { type: String, required: true, trim: true },
    adSource: { type: String, trim: true },
    allowBilling: { type: Boolean, default: false },
    taxExempt: { type: Boolean, default: false },
    addressIds: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', clientSchema);
