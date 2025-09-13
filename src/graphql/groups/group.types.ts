import { gql } from 'apollo-server-express';

export const groupTypes = gql`
  type EntityChat {
    entityChatId: String!
    entityId: String!
    userId: String!
    messages: [EntityChatMessage!]!
  }

  type EntityChatMessage {
    userId: String!
    message: String!
    createdAt: String!
  }

  input CreateEntityChatInput {
    entityId: String!
  }

  input AddMessageToEntityChatInput {
    entityChatId: String!
    message: String!
  }

  input GetEntityChatInput {
    entityChatId: String!
  }

  type EntityChatResponse {
    success: Boolean!
    message: String!
    entityChat: EntityChat
  }

  type EntityChatMessagesResponse {
    success: Boolean!
    message: String!
    entityChatMessages: [EntityChatMessage!]!
  }

  extend type Query {
    getEntityChat(input: GetEntityChatInput!): EntityChatResponse!
  }

  extend type Mutation {
    createEntityChat(input: CreateEntityChatInput!): EntityChatResponse!
    addMessageToEntityChat(
      input: AddMessageToEntityChatInput!
    ): EntityChatResponse!
  }
`;
