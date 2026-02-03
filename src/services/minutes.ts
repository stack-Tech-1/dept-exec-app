// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\services\minutes.ts
import API from './api';

export interface MinutesRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  minutesText: string;
  recordingUrl?: string;
  recordingFilename?: string;
  attendance: string[];
  session: string;
  semester: string;
  approved: boolean;
  approvedBy?: { id: string; name: string; email: string };
  approvedAt?: string;
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMinutesData {
  title: string;
  date: string;
  time: string;
  venue: string;
  minutesText: string;
  attendance: string; // JSON string
  session: string;
  semester: string;
  recording?: File;
}

class MinutesService {
  // Get all minutes
  async getAllMinutes(): Promise<MinutesRecord[]> {
    return API.get('/minutes');
  }

  // Get minutes by ID
  async getMinutesById(id: string): Promise<MinutesRecord> {
    return API.get(`/minutes/${id}`);
  }

  // Create minutes
  async createMinutes(data: FormData): Promise<MinutesRecord> {
    return API.post('/minutes', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Update minutes
  async updateMinutes(id: string, data: Partial<CreateMinutesData>): Promise<MinutesRecord> {
    return API.put(`/minutes/${id}`, data);
  }

  // Approve minutes
  async approveMinutes(id: string): Promise<MinutesRecord> {
    return API.post(`/minutes/${id}/approve`);
  }

  // Delete minutes
  async deleteMinutes(id: string): Promise<void> {
    return API.delete(`/minutes/${id}`);
  }

  // Download PDF
  async downloadPDF(id: string): Promise<Blob> {
    return API.get(`/minutes/${id}/download`, {
      responseType: 'blob',
    });
  }

  // Get minutes statistics
  async getStatistics(): Promise<{
    total: number;
    approved: number;
    pending: number;
    bySession: Record<string, number>;
    bySemester: Record<string, number>;
  }> {
    return API.get('/minutes/statistics');
  }
}

export const minutesService = new MinutesService();
export default minutesService;