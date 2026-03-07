import API from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AssistantSuggestions {
  suggestions: string[];
  stats: {
    memberCount: number;
    overdueTasks: number;
    openTickets: number;
    upcomingEvents: number;
  };
}

class AssistantService {
  async chat(message: string, history: ChatMessage[]): Promise<ChatMessage> {
    return API.post('/assistant/chat', { message, history }) as any;
  }
  async getSuggestions(): Promise<AssistantSuggestions> {
    return API.get('/assistant/suggestions') as any;
  }
}

export const assistantService = new AssistantService();
export default assistantService;
