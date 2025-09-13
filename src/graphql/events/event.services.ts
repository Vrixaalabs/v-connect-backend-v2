import { Event, IEvent } from '../../models/events';  
import { CreateEventInput, UpdateEventInput, EventFilterInput, GetEventsArgs } from './event.interface';
import { Types } from 'mongoose';

export class EventService {

    /**
 * Create a new event
 * @param input - Data for the new event
 * @param {Types.ObjectId} createdBy - The ID of the user creating the event
 */
   
  public async create(input: CreateEventInput, createdBy: Types.ObjectId): Promise<IEvent> {
    try {
      const event = new Event({
        ...input,
        createdBy,
      });
      await event.save();
      return event;
    } catch (error) {
      throw new Error(`Could not create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a single event by its public eventId
   * @param eventId - The public UUID of the event
   */
  public async findByEventId(eventId: string): Promise<IEvent | null> {
    return Event.findOne({ eventId })
      .populate('createdBy', 'name email') // Example fields
      .populate('entity', 'name')
      .exec();
  }

  /**
   * Find all events with optional filtering and pagination
   * @param query - Filter and pagination options
   */
  public async findAll(query: GetEventsArgs): Promise<IEvent[]> {
    const { entityId, limit = 10, offset = 0 } = query;
    const filter: any = {};
    if (entityId) {
      filter.entity = entityId;
    }

    return Event.find(filter)
      .sort({ startDate: -1 }) // Show newest events first
      .skip(offset)
      .limit(limit)
      .populate('createdBy', 'name')
      .exec();
  }

  /**
   * Update an event's details
   * @param eventId - The public UUID of the event to update
   * @param input - The fields to update
   */
  public async update(eventId: string, input: UpdateEventInput): Promise<IEvent | null> {
    const event = await Event.findOneAndUpdate({ eventId }, { $set: input }, { new: true }).exec();
    if (!event) {
      throw new Error('Event not found.');
    }
    return event;
  }

  /**
   * Delete an event
   * @param eventId - The public UUID of the event to delete
   */
  public async delete(eventId: string): Promise<boolean> {
    const result = await Event.deleteOne({ eventId }).exec();
    return result.deletedCount === 1;
  }

  
  public async addAttendee(eventId: string, userId: Types.ObjectId): Promise<IEvent | null> {
    return Event.findOneAndUpdate(
      { eventId },
      { $addToSet: { attendees: userId } },
      { new: true }
    ).exec();
  }

  
  public async removeAttendee(eventId: string, userId: Types.ObjectId): Promise<IEvent | null> {
    return Event.findOneAndUpdate(
      { eventId },
      { $pull: { attendees: userId } },
      { new: true }
    ).exec();
  }
  
  
  public async addFollower(eventId: string, userId: Types.ObjectId): Promise<IEvent | null> {
    return Event.findOneAndUpdate(
        { eventId },
        { $addToSet: { followers: userId } },
        { new: true }
    ).exec();
  }
 
  public async removeFollower(eventId: string, userId: Types.ObjectId): Promise<IEvent | null> {
    return Event.findOneAndUpdate(
        { eventId },
        { $pull: { followers: userId } },
        { new: true }
    ).exec();
  }
}
 
export const eventService = new EventService();