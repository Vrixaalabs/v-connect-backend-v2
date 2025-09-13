import { IEvent } from '../../models/events';

// Base Response Types
interface BaseResponse {
  success: boolean;
  message: string;
}

// Event Response Types
export interface EventResponse extends BaseResponse {
  event?: IEvent;
}

export interface EventsResponse extends BaseResponse {
  events: IEvent[];
  total: number;
  page: number;
  limit: number;
}

// Query Request Types
export interface GetEventByIdArgs {
  eventId: string;
}

export interface GetEventsArgs {
  entityId?: string;
  limit?: number;
  offset?: number;
}

// Mutation Request Types
export interface CreateEventArgs {
  input: CreateEventInput;
}

export interface UpdateEventArgs {
  eventId: string;
  input: UpdateEventInput;
}

export interface DeleteEventArgs {
  eventId: string;
}

export interface AddAttendeeArgs {
  eventId: string;
  userId: string;
}

export interface RemoveAttendeeArgs {
  eventId: string;
  userId: string;
}

export interface FollowEventArgs {
  eventId: string;
  userId: string;
}

export interface UnfollowEventArgs {
  eventId: string;
  userId: string;
}

// Input Types
export interface CreateEventInput {
  title: string;
  description?: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  entity: string;
  parentEvent?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  coverImage?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface EventFilterInput {
  entityId?: string;
  isActive?: boolean;
  search?: string;
}