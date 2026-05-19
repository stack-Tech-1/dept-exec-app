import API from './api'

export interface VotingSession {
  token: string
  label: string
  elections: string[]
  expiresAt?: string
  status: 'ACTIVE' | 'EXPIRED' | 'DEACTIVATED'
  createdAt: string
  createdBy?: { name: string }
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

  async deleteSession(token: string): Promise<{ message: string }> {
    return API.delete(`/voting-sessions/${token}`) as any
  }
}

export const votingSessionService = new VotingSessionService()
export default votingSessionService
