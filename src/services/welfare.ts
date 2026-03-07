import API from './api';

export type WelfareCategory = 'ACADEMIC' | 'FINANCIAL' | 'HARASSMENT' | 'GENERAL' | 'SUGGESTION';
export type WelfareStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
export type WelfarePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WelfareTicket {
  _id: string;
  ticketId: string;
  category: WelfareCategory;
  subject: string;
  description: string;
  isAnonymous: boolean;
  submitterName?: string;
  submitterMatric?: string;
  submitterEmail?: string;
  status: WelfareStatus;
  priority: WelfarePriority;
  assignedTo?: { name: string; position: string };
  responses: Array<{
    responder: { name: string; position: string };
    responderName: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  resolvedAt?: string;
  resolvedBy?: { name: string };
  createdAt: string;
}

export interface WelfareStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  byCategory: Record<string, number>;
}

class WelfareService {
  async getTickets(params?: { status?: string; category?: string; priority?: string }): Promise<{ tickets: WelfareTicket[]; total: number }> {
    return API.get('/welfare', { params }) as any;
  }
  async getTicketById(id: string): Promise<WelfareTicket> {
    return API.get(`/welfare/${id}`) as any;
  }
  async respondToTicket(id: string, message: string, isInternal?: boolean): Promise<WelfareTicket> {
    return API.post(`/welfare/${id}/respond`, { message, isInternal }) as any;
  }
  async updateTicket(id: string, data: { status?: string; priority?: string; assignedTo?: string }): Promise<WelfareTicket> {
    return API.patch(`/welfare/${id}`, data) as any;
  }
  async getStats(): Promise<WelfareStats> {
    return API.get('/welfare/stats') as any;
  }
}

export const welfareService = new WelfareService();
export default welfareService;
