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

  async pauseSession(token: string): Promise<{ message: string; isPaused: boolean }> {
    return API.patch(`/voting-sessions/${token}/pause`, {}) as any
  }

  async resumeSession(token: string): Promise<{ message: string; isPaused: boolean }> {
    return API.patch(`/voting-sessions/${token}/resume`, {}) as any
  }

  async deleteSession(token: string): Promise<{ message: string }> {
    return API.delete(`/voting-sessions/${token}`) as any
  }
}

export const votingSessionService = new VotingSessionService()
export default votingSessionService
