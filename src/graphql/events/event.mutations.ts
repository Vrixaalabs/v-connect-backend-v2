import { AuthenticationError } from 'apollo-server-express';
import { eventService } from './event.services';
import { CreateEventInput, UpdateEventInput } from './event.interface';

interface ApolloContext {
  user?: {
    _id: string;
  };
}

export const eventMutations = {
 
  createEvent: async (_: any, { input }: { input: CreateEventInput }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to create an event.');
    }
    return eventService.create(input, context.user._id);
  },
 
  updateEvent: async (_: any, { eventId, input }: { eventId: string; input: UpdateEventInput }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to update an event.');
    }
    const updatedEvent = await eventService.update(eventId, input);
    if (!updatedEvent) {
      throw new Error('Event not found or update failed.');
    }
    return updatedEvent;
  },

   
  deleteEvent: async (_: any, { eventId }: { eventId: string }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to delete an event.');
    }
    return eventService.delete(eventId);
  },
 
  addAttendee: async (_: any, { eventId, userId }: { eventId: string; userId: string }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to add an attendee.');
    }
    return eventService.addAttendee(eventId, userId);
  },

   
  removeAttendee: async (_: any, { eventId, userId }: { eventId: string; userId: string }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to remove an attendee.');
    }
    return eventService.removeAttendee(eventId, userId);
  },
 
  followEvent: async (_: any, { eventId, userId }: { eventId: string; userId: string }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to follow an event.');
    }
    return eventService.addFollower(eventId, userId);
  },

   
  unfollowEvent: async (_: any, { eventId, userId }: { eventId: string; userId: string }, context: ApolloContext) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to unfollow an event.');
    }
    return eventService.removeFollower(eventId, userId);
  },
};