import { Document } from 'mongoose';

export interface IEntityChatMessage {
  userId: string;
  message: string;
  createdAt: Date;
}

export interface IEntityChat extends Document {
  entityChatId: string;
  entityId: string;
  userId: string;
  messages: IEntityChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseEntityChatResponse {
  success: boolean;
  message: string;
}

export interface CommonEntityChatResponse extends BaseEntityChatResponse {
  entityChat: IEntityChat;
}

export interface CreateEntityChatInput {
  entityId: string;
}

export interface CreateEntityChatArgs {
  input: CreateEntityChatInput;
}

export interface AddMessageToEntityChatInput {
  entityChatId: string;
  message: string;
}

export interface AddMessageToEntityChatArgs {
  input: AddMessageToEntityChatInput;
}

export interface GetEntityChatInput {
  entityChatId: string;
}

export interface GetEntityChatArgs {
  input: GetEntityChatInput;
}
