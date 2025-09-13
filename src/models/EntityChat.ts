import mongoose, { Schema } from 'mongoose';
import { IEntityChat } from '@/graphql/groups/group.interfaces';
import { v4 as uuidv4 } from 'uuid';

const entityChatSchema = new Schema<IEntityChat>(
  {
    entityChatId: {
      type: String,
      required: true,
      default: uuidv4,
    },
    entityId: {
      type: String,
      required: true,
      ref: 'Entity',
      refPath: 'entityId',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
      refPath: 'userId',
    },
    messages: {
      type: [
        {
          userId: String,
          message: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EntityChat = mongoose.model('EntityChat', entityChatSchema);
