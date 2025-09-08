import { eventService } from './event.services';

export const eventQueries = {
   
  event: async (_: any, { eventId }: { eventId: string }) => {
    return eventService.findByEventId(eventId);
  },

   
  events: async (_: any, { entityId, limit, offset }: { entityId?: string; limit?: number; offset?: number }) => {
    return eventService.findAll({ entityId, limit, offset });
  },
};