// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\services\search.ts
import API from './api'

export interface SearchResult {
  type: 'task' | 'minutes' | 'meeting' | 'user'
  id: string
  title: string
  description: string
  date?: string
  assignedTo?: string
  status?: string
  priority?: string
  url: string
  [key: string]: any
}

export interface SearchResponse {
  query: string
  total: number
  limit: number
  offset: number
  types: string[]
  results: SearchResult[]
}

class SearchService {
  async globalSearch(query: string, limit: number = 10, offset: number = 0, types: string = 'all'): Promise<SearchResponse> {
    try {
      const response = await API.get('/search', {
        params: { q: query, limit, offset, types }
      }) as any
      return response as SearchResponse
    } catch (error: any) {
      console.error('Search failed:', error)
      throw new Error(error.response?.data?.message || 'Search failed')
    }
  }

  async searchTasks(query: string, limit: number = 10): Promise<SearchResult[]> {
    const response = await this.globalSearch(query, limit, 0, 'tasks')
    return response.results
  }

  async searchMinutes(query: string, limit: number = 10): Promise<SearchResult[]> {
    const response = await this.globalSearch(query, limit, 0, 'minutes')
    return response.results
  }

  async searchMeetings(query: string, limit: number = 10): Promise<SearchResult[]> {
    const response = await this.globalSearch(query, limit, 0, 'meetings')
    return response.results
  }

  async searchUsers(query: string, limit: number = 10): Promise<SearchResult[]> {
    const response = await this.globalSearch(query, limit, 0, 'users')
    return response.results
  }
}

export const searchService = new SearchService()