import API from './api'

export interface SessionElectionRef {
  _id: string
  title: string
  position: string
  status: 'PENDING' | 'OPEN' | 'PAUSED' | 'CLOSED'
}

export interface VotingSession {
  token: string
  label: string
  elections: SessionElectionRef[]
  isActive: boolean
  isPaused?: boolean
  expiresAt?: string
  status?: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'DEACTIVATED'
  createdAt: string
  createdBy?: { name: string }
}

export interface SessionVoter {
  identifier: string
  name: string | null
  votedAt: string
}

export interface RevocationElection {
  electionId: string
  electionTitle: string
  candidateId: string | null
  candidateName: string | null
  votedAt: string
}

export interface RevocationEntry {
  identifier: string
  revokedAt: string
  revokedBy: { name: string; position: string } | null
  elections: RevocationElection[]
  memberName: string | null
  memberLevel: string | null
  memberIsDeleted: boolean
}

export function getSessionStatus(s: VotingSession): 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'DEACTIVATED' {
  if (!s.isActive) return 'DEACTIVATED'
  if (s.expiresAt && new Date(s.expiresAt) < new Date()) return 'EXPIRED'
  if (s.isPaused) return 'PAUSED'
  return 'ACTIVE'
}

class VotingSessionService {
  async createSession(data: { elections: string[]; label: string; expiresAt?: string }): Promise<VotingSession> {
    return API.post('/voting-sessions', data) as any
  }

  async getSessions(): Promise<VotingSession[]> {
    return API.get('/voting-sessions') as any
  }

  async deactivateSession(token: string): Promise<VotingSession> {
    return API.patch(`/voting-sessions/${token}/deactivate`, {}) as any
  }

  async closeSessionElections(token: string): Promise<{ message: string }> {
    return API.patch(`/voting-sessions/${token}/close-all`, {}) as any
  }

  async getSessionVoters(token: string): Promise<SessionVoter[]> {
    return API.get(`/voting-sessions/${token}/voters`) as any
  }

  async revokeVote(token: string, matricNumber: string): Promise<{ message: string }> {
    return API.delete(`/voting-sessions/${token}/votes/${encodeURIComponent(matricNumber)}`) as any
  }

  async pauseSession(token: string): Promise<{ message: string; isPaused: boolean }> {
    return API.patch(`/voting-sessions/${token}/pause`, {}) as any
  }

  async resumeSession(token: string): Promise<{ message: string; isPaused: boolean }> {
    return API.patch(`/voting-sessions/${token}/resume`, {}) as any
  }

  async deleteSession(token: string): Promise<{ message: string }> {
    return API.delete(`/voting-sessions/${token}`) as any
  }

  async getRevocationLog(token: string): Promise<RevocationEntry[]> {
    return API.get(`/voting-sessions/${token}/revocation-log`) as any
  }
}

export const votingSessionService = new VotingSessionService()
export default votingSessionService
