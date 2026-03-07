import API from './api';

export interface HandoverSections {
  responsibilities?: string;
  ongoingProjects?: string;
  keyContacts?: string;
  accessAndPasswords?: string;
  adviceAndTips?: string;
  pendingIssues?: string;
  resources?: string;
}

export interface Handover {
  _id: string;
  position: string;
  session: string;
  status: 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';
  outgoingExec: { name: string; position: string };
  incomingExec?: { name: string; position: string };
  sections: HandoverSections;
  submittedAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

class HandoverService {
  async getHandovers(params?: { session?: string; position?: string; status?: string }): Promise<Handover[]> {
    return API.get('/handover', { params }) as any;
  }
  async getHandoverById(id: string): Promise<Handover> {
    return API.get(`/handover/${id}`) as any;
  }
  async createHandover(data: { position: string; session: string; incomingExec?: string; sections?: HandoverSections }): Promise<Handover> {
    return API.post('/handover', data) as any;
  }
  async updateHandover(id: string, data: { sections?: HandoverSections; status?: string; incomingExec?: string }): Promise<Handover> {
    return API.put(`/handover/${id}`, data) as any;
  }
}

export const handoverService = new HandoverService();
export default handoverService;
