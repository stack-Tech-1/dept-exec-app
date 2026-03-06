import API from './api';

export interface Member {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  matricNumber?: string;
  level: '100' | '200' | '300' | '400' | '500';
  gender?: 'Male' | 'Female' | 'Other';
  stateOfOrigin?: string;
  isActive: boolean;
  addedBy?: { name: string };
  dues?: Array<{
    session: string;
    semester: string;
    amount: number;
    paid: boolean;
    paidAt?: string;
    note?: string;
  }>;
  notes?: string;
  createdAt: string;
}

export interface MemberStats {
  total: number;
  byLevel: Record<string, number>;
  byGender: Record<string, number>;
  dues: { paid: number; unpaid: number };
}

class MembersService {
  async getMembers(params?: { level?: string; gender?: string; search?: string; duesPaid?: boolean; session?: string; page?: number }): Promise<{ members: Member[]; total: number; pages: number }> {
    return API.get('/members', { params }) as any;
  }

  async getMemberById(id: string): Promise<Member> {
    return API.get(`/members/${id}`) as any;
  }

  async createMember(data: Partial<Member>): Promise<Member> {
    return API.post('/members', data) as any;
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    return API.put(`/members/${id}`, data) as any;
  }

  async deleteMember(id: string): Promise<void> {
    return API.delete(`/members/${id}`) as any;
  }

  async recordDues(id: string, data: { session: string; semester: string; amount: number; paid: boolean; note?: string }): Promise<Member> {
    return API.post(`/members/${id}/dues`, data) as any;
  }

  async bulkImport(members: Partial<Member>[]): Promise<{ message: string; count: number }> {
    return API.post('/members/bulk-import', { members }) as any;
  }

  async getStats(session?: string): Promise<MemberStats> {
    return API.get('/members/stats', { params: session ? { session } : {} }) as any;
  }
}

export const membersService = new MembersService();
export default membersService;
