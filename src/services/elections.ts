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
  status: 'PENDING' | 'OPEN' | 'PAUSED' | 'CLOSED';
  candidates: Candidate[];
  totalVotes: number;
  undecidedCount?: number;
  createdBy: { name: string; position: string };
  openedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface BreakdownVoter {
  matricNumber: string;
  name: string;
  votedAt: string;
}

export interface BreakdownCandidate {
  _id: string;
  name: string;
  matricNumber?: string;
  photo?: string;
  voteCount: number;
  voters: BreakdownVoter[];
}

export interface AllVoter {
  matricNumber: string;
  name: string;
  votedAt: string | null;
}

export interface AuditVote {
  electionId: string
  electionTitle: string
  electionPosition: string
  electionSession: string
  candidateName: string | null
  candidateMatric: string | null
  votedAt: string
}
export interface DeletedVoterRecord {
  member: { _id: string; name: string; matricNumber: string; level: string; isActive: false }
  votes: AuditVote[]
}
export interface OrphanVoter {
  matricNumber: string; name: string | null; isDeleted: boolean; votedAt: string
}
export interface OrphanVoteGroup {
  electionId: string; electionTitle: string; electionPosition: string; electionSession: string
  removedCandidateId: string; voteCount: number; voters: OrphanVoter[]
}
export interface VoteAudit {
  deletedVoterRecords: DeletedVoterRecord[]
  orphanVotes: OrphanVoteGroup[]
}

export interface VoterBreakdown {
  electionId: string;
  title: string;
  position: string;
  session: string;
  totalVotes: number;
  candidates: BreakdownCandidate[];
  allVoters?: AllVoter[];
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
  async deleteElection(id: string): Promise<void> {
    return API.delete(`/elections/${id}`) as any;
  }
  async getVoterBreakdown(id: string): Promise<VoterBreakdown> {
    return API.get(`/elections/${id}/voter-breakdown`) as any;
  }
  async getVoteAudit(): Promise<VoteAudit> {
    return API.get('/elections/vote-audit') as any;
  }
}

export const electionsService = new ElectionsService();
export default electionsService;
