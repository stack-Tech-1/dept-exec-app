import API from './api';

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  audience: 'ALL' | 'MEMBERS_ONLY' | 'EXEC_ONLY' | 'LEVEL_100' | 'LEVEL_200' | 'LEVEL_300' | 'LEVEL_400' | 'LEVEL_500';
  priority: 'normal' | 'urgent';
  sentBy: { name: string; position: string };
  recipientCount: number;
  emailsSent: number;
  emailsFailed: number;
  notificationsSent: number;
  status: 'SENDING' | 'SENT' | 'FAILED';
  createdAt: string;
}

class AnnouncementsService {
  async getAnnouncements(): Promise<{ announcements: Announcement[]; total: number }> {
    return API.get('/announcements') as any;
  }
  async sendAnnouncement(data: {
    title: string;
    body: string;
    audience: string;
    priority: string;
  }): Promise<{ message: string; announcement: Announcement }> {
    return API.post('/announcements', data) as any;
  }
}

export const announcementsService = new AnnouncementsService();
export default announcementsService;
