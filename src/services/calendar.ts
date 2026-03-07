import API from './api';

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'EXAM' | 'IESA_EVENT' | 'DEADLINE' | 'HOLIDAY' | 'ACADEMIC' | 'OTHER';
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  session?: string;
  color: string;
  createdBy: { name: string };
  createdAt: string;
}

class CalendarService {
  async getEvents(params?: { month?: number; year?: number; session?: string; type?: string }): Promise<CalendarEvent[]> {
    return API.get('/calendar', { params }) as any;
  }
  async getUpcoming(): Promise<CalendarEvent[]> {
    return API.get('/calendar/upcoming') as any;
  }
  async createEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return API.post('/calendar', data) as any;
  }
  async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return API.put(`/calendar/${id}`, data) as any;
  }
  async deleteEvent(id: string): Promise<void> {
    return API.delete(`/calendar/${id}`) as any;
  }
}

export const calendarService = new CalendarService();
export default calendarService;
