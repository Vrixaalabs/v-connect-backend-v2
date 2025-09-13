import { gql } from 'apollo-server-express';

export const eventTypeDefs = gql`
  # A custom scalar for date-time in ISO 8601 format
  scalar DateTime

  # The main Event object type
  type Event {
    id: ID!
    eventId: String!
    title: String!
    description: String
    coverImage: String
    startDate: DateTime!
    endDate: DateTime!
    isVerified: Boolean!
    isActive: Boolean!

    # --- Relationships ---
    entity: Entity!
    createdBy: User!
    verifiedBy: User
    attendees: [User!]
    followers: [User!]
    posts: [EventPost!]
    parentEvent: Event
    subEvents: [Event!]

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # --- Input Types for Mutations ---

  # Input for creating a new event
  input CreateEventInput {
    title: String!
    description: String
    coverImage: String
    startDate: DateTime!
    endDate: DateTime!
    entity: ID! # The ID of the parent entity
    parentEvent: ID
  }

  # Input for updating an existing event
  input UpdateEventInput {
    title: String
    description: String
    coverImage: String
    startDate: DateTime
    endDate: DateTime
    isActive: Boolean
  }

  # --- Queries ---
  type Query {
    # Get a single event by its public eventId
    event(eventId: String!): Event

    # Get a list of events, with optional filtering and pagination
    events(entityId: ID, limit: Int = 10, offset: Int = 0): [Event!]
  }

  # --- Mutations ---
  type Mutation {
    # Create a new event
    createEvent(input: CreateEventInput!): Event!

    # Update an existing event
    updateEvent(eventId: String!, input: UpdateEventInput!): Event!

    # Delete an event
    deleteEvent(eventId: String!): Boolean!

    # Add an attendee to an event
    addAttendee(eventId: String!, userId: ID!): Event!

    # Remove an attendee from an event
    removeAttendee(eventId: String!, userId: ID!): Event!

    # Follow an event
    followEvent(eventId: String!, userId: ID!): Event!

    # Unfollow an event
    unfollowEvent(eventId: String!, userId: ID!): Event!
  }
`;