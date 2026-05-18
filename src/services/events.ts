import API from './api';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  type: 'SOCIAL' | 'ACADEMIC' | 'COMPETITION' | 'DEPARTMENTAL_WEEK';
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  expectedAttendance?: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  rsvps: Array<{
    user: { _id: string; name: string; position: string };
    response: 'GOING' | 'NOT_GOING' | 'MAYBE';
    respondedAt: string;
  }>;
  createdBy: { name: string; position: string };
  tags?: string[];
  isPaidEvent?: boolean;
  ticketPrice?: number;
  ticketItems?: string[];
  guestRegistrationEnabled?: boolean;
  createdAt: string;
}

export interface EventStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
}

class EventsService {
  async getEvents(params?: {
    status?: string;
    type?: string;
    upcoming?: boolean;
    page?: number;
  }): Promise<{ events: Event[]; total: number }> {
    return API.get('/events', { params }) as any;
  }

  async getEventById(id: string): Promise<Event> {
    return API.get(`/events/${id}`) as any;
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    return API.post('/events', data) as any;
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return API.put(`/events/${id}`, data) as any;
  }

  async updateEventStatus(id: string, status: string): Promise<Event> {
    return API.patch(`/events/${id}/status`, { status }) as any;
  }

  async rsvp(id: string, response: 'GOING' | 'NOT_GOING' | 'MAYBE'): Promise<Event> {
    return API.post(`/events/${id}/rsvp`, { response }) as any;
  }

  async getStats(): Promise<EventStats> {
    return API.get('/events/stats') as any;
  }
}

export const eventsService = new EventsService();
export default eventsService;
