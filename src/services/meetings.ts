// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\services\meetings.ts
import API from './api';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda?: string;
  zoomLink?: string;
  meetingType: 'zoom' | 'physical' | 'hybrid';
  rsvpDeadline?: string;
  minutesId?: string;
  createdBy: { id: string; name: string; email: string };
  attendees?: Array<{
    userId: string;
    name: string;
    position: string;
    status: 'attending' | 'not_attending' | 'maybe' | 'pending';
  }>;
  session: string;
  semester: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingData {
  title: string;
  date: string;
  time: string;
  venue: string;
  agenda?: string;
  zoomLink?: string;
  meetingType: 'zoom' | 'physical' | 'hybrid';
  rsvpDeadline?: string;
  session: string;
  semester: string;
  attendees?: string[]; // Array of user IDs
}

class MeetingsService {
  // Get all meetings
  async getAllMeetings(): Promise<Meeting[]> {
    return API.get('/meetings');
  }

  // Get meetings by ID
  async getMeetingById(id: string): Promise<Meeting> {
    return API.get(`/meetings/${id}`);
  }

  // Get upcoming meetings
  async getUpcomingMeetings(limit?: number): Promise<Meeting[]> {
    const url = limit ? `/meetings/upcoming?limit=${limit}` : '/meetings/upcoming';
    return API.get(url);
  }

  // Create meeting (admin only)
  async createMeeting(data: CreateMeetingData): Promise<Meeting> {
    return API.post('/meetings', data);
  }

  // Update meeting (admin only)
  async updateMeeting(id: string, data: Partial<CreateMeetingData>): Promise<Meeting> {
    return API.put(`/meetings/${id}`, data);
  }

  // Delete meeting (admin only)
  async deleteMeeting(id: string): Promise<void> {
    return API.delete(`/meetings/${id}`);
  }

  // Update RSVP status
  async updateRsvp(meetingId: string, status: 'attending' | 'not_attending' | 'maybe'): Promise<void> {
    return API.post(`/meetings/${meetingId}/rsvp`, { status });
  }

  // Get meeting statistics
  async getStatistics(): Promise<{
    total: number;
    upcoming: number;
    past: number;
    byType: Record<string, number>;
    attendanceRate: number;
  }> {
    return API.get('/meetings/statistics');
  }

  // Get user's meetings
  async getUserMeetings(): Promise<Meeting[]> {
    return API.get('/meetings/user');
  }

  // Link minutes to meeting
  async linkMinutes(meetingId: string, minutesId: string): Promise<void> {
    return API.post(`/meetings/${meetingId}/minutes`, { minutesId });
  }
}

export const meetingsService = new MeetingsService();
export default meetingsService;