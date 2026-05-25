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
  isDirectEntry?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface MemberStats {
  total: number;
  byLevel: Record<string, number>;
  byGender: Record<string, number>;
  dues: { paid: number; unpaid: number };
}

export interface RegistrationLink {
  _id: string;
  label: string;
  token: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'EXPIRED';
  createdAt: string;
  createdBy?: { name: string };
}

class MembersService {
  async getMembers(params?: { level?: string; gender?: string; search?: string; duesPaid?: boolean; session?: string; page?: number; limit?: number; isActive?: boolean }): Promise<{ members: Member[]; total: number; pages: number }> {
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

  async sendVoteCode(id: string): Promise<{ message: string }> {
    return API.post(`/members/${id}/send-vote-code`) as any;
  }

  async bulkImport(members: Partial<Member>[]): Promise<{ message: string; count: number }> {
    return API.post('/members/bulk-import', { members }) as any;
  }

  async getStats(session?: string): Promise<MemberStats> {
    return API.get('/members/stats', { params: session ? { session } : {} }) as any;
  }

  async createRegistrationLink(data: { label: string; expiresAt?: string }): Promise<RegistrationLink> {
    return API.post('/members/links', data) as any;
  }

  async getRegistrationLinks(): Promise<RegistrationLink[]> {
    return API.get('/members/links') as any;
  }

  async deleteRegistrationLink(id: string): Promise<void> {
    return API.delete(`/members/links/${id}`) as any;
  }

  async listPendingDE(): Promise<Member[]> {
    return API.get('/members/pending-de') as any;
  }

  async approveMember(id: string): Promise<{ message: string; member: Member }> {
    return API.patch(`/members/${id}/approve`, {}) as any;
  }

  async rejectMember(id: string): Promise<{ message: string }> {
    return API.delete(`/members/${id}/reject`) as any;
  }

  async restoreMember(id: string): Promise<Member> {
    return API.patch(`/members/${id}/restore`, {}) as any;
  }
}

export const membersService = new MembersService();
export default membersService;
