import API from './api';

export interface Candidate {
  _id: string;
  name: string;
  matricNumber?: string;
  bio?: string;
  photo?: string;
  voteCount: number;
}

export interface Election {
  _id: string;
  title: string;
  position: string;
  session: string;
  description?: string;
  status: 'PENDING' | 'OPEN' | 'CLOSED';
  candidates: Candidate[];
  totalVotes: number;
  createdBy: { name: string; position: string };
  openedAt?: string;
  closedAt?: string;
  createdAt: string;
}

class ElectionsService {
  async getElections(params?: { status?: string; session?: string }): Promise<Election[]> {
    return API.get('/elections', { params }) as any;
  }
  async getElectionById(id: string): Promise<Election> {
    return API.get(`/elections/${id}`) as any;
  }
  async createElection(data: {
    title: string;
    position: string;
    session: string;
    description?: string;
  }): Promise<Election> {
    return API.post('/elections', data) as any;
  }
  async addCandidate(electionId: string, formData: FormData): Promise<Election> {
    return API.post(`/elections/${electionId}/candidates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as any;
  }
  async removeCandidate(electionId: string, candidateId: string): Promise<Election> {
    return API.delete(`/elections/${electionId}/candidates/${candidateId}`) as any;
  }
  async updateStatus(electionId: string, status: string): Promise<Election> {
    return API.patch(`/elections/${electionId}/status`, { status }) as any;
  }
}

export const electionsService = new ElectionsService();
export default electionsService;
