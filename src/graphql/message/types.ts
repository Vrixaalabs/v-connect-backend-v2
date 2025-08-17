import { gql } from 'apollo-server-express';

export const messageTypes = gql`
  type Message {
    id: ID!
    content: String!
    userId: ID!
    roomId: String!
    createdAt: String!
    user: User
  }

  type Room {
    id: ID!
    name: String!
    messages: [Message!]!
    participants: [User!]!
    createdAt: String!
  }

  extend type Query {
    messages(roomId: String!): [Message!]!
    rooms: [Room!]!
  }

  extend type Mutation {
    createMessage(content: String!, roomId: String!): Message!
    createRoom(name: String!): Room!
    joinRoom(roomId: String!): Room!
    leaveRoom(roomId: String!): Boolean!
  }

  extend type Subscription {
    messageAdded(roomId: String!): Message!
    userJoined(roomId: String!): User!
    userLeft(roomId: String!): User!
  }
`;
