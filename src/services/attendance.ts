import API from './api';

export interface AttendanceSession {
  _id: string;
  title: string;
  description?: string;
  sessionCode: string;
  status: 'OPEN' | 'CLOSED';
  createdBy: { name: string; position: string };
  closedAt?: string;
  attendees: Array<{
    name: string;
    matricNumber: string;
    level: string;
    markedAt: string;
  }>;
  createdAt: string;
}

class AttendanceService {
  async getSessions(params?: { status?: string }): Promise<{ sessions: AttendanceSession[]; total: number }> {
    return API.get('/attendance', { params }) as any;
  }
  async getSessionById(id: string): Promise<AttendanceSession> {
    return API.get(`/attendance/${id}`) as any;
  }
  async createSession(data: { title: string; description?: string }): Promise<AttendanceSession> {
    return API.post('/attendance', data) as any;
  }
  async closeSession(id: string): Promise<AttendanceSession> {
    return API.patch(`/attendance/${id}/close`, {}) as any;
  }
  async exportSession(id: string): Promise<void> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/attendance/${id}/export`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
