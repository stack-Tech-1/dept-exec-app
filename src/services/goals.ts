// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\services\goals.ts
import API from './api';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'administrative' | 'social' | 'infrastructure' | 'other';
  targetDate: string;
  startDate: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'behind-schedule' | 'at-risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  tasks: Array<{
    taskId: string;
    title: string;
    status: string;
    weight: number;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    targetDate: string;
    completed: boolean;
    completedAt?: string;
  }>;
  assignedTo: Array<{
    id: string;
    name: string;
    email: string;
    position: string;
  }>;
  createdBy: {
    id: string;
    name: string;
    email: string;
    position: string;
  };
  kpis: Array<{
    name: string;
    target: number;
    current: number;
    unit: string;
  }>;
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  tags: string[];
  notes: Array<{
    content: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
  daysRemaining: number;
  daysElapsed: number;
  expectedProgress: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  category?: string;
  targetDate: string;
  priority?: string;
  department?: string;
  assignedTo?: string[];
  kpis?: Array<{ name: string; target: number; unit: string }>;
  budget?: { allocated: number; currency?: string };
  milestones?: Array<{ title: string; description: string; targetDate: string }>;
  tags?: string[];
  progress?: number;
  status?: string;
  notes?: Array<{ content: string }>;
}

export interface GoalStatistics {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  atRiskGoals: number;
  behindScheduleGoals: number;
  averageProgress: number;
  upcomingDeadlines: number;
  byCategory: Record<string, { count: number; avgProgress: number }>;
  byPriority: Record<string, number>;
}

class GoalsService {
  // Get all goals
  async getAllGoals(params?: {
    category?: string;
    status?: string;
    priority?: string;
  }): Promise<Goal[]> {
    return API.get('/goals', { params });
  }

  // Get goal by ID
  async getGoalById(id: string): Promise<Goal> {
    return API.get(`/goals/${id}`);
  }

  // Get goal statistics
  async getStatistics(): Promise<GoalStatistics> {
    return API.get('/goals/statistics');
  }

  // Create goal (admin only)
  async createGoal(data: CreateGoalData): Promise<Goal> {
    return API.post('/goals', data);
  }

  // Update goal
  async updateGoal(id: string, data: Partial<CreateGoalData>): Promise<Goal> {
    return API.put(`/goals/${id}`, data);
  }

  // Link task to goal
  async linkTask(goalId: string, taskId: string, weight?: number): Promise<Goal> {
    return API.post(`/goals/${goalId}/tasks`, { taskId, weight });
  }

  // Archive goal (admin only)
  async archiveGoal(id: string): Promise<{ message: string; goalId: string }> {
    return API.post(`/goals/${id}/archive`);
  }

  // Get goals for dashboard (recent/upcoming)
  async getDashboardGoals(limit: number = 3): Promise<Goal[]> {
    const goals = await this.getAllGoals();
    return goals
      .filter(g => !g.isArchived && g.status !== 'completed')
      .sort((a, b) => {
        // Sort by priority (critical > high > medium > low)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by days remaining
        return a.daysRemaining - b.daysRemaining;
      })
      .slice(0, limit);
  }

  // Calculate goal health based on progress vs expected
  calculateGoalHealth(goal: Goal): 'healthy' | 'warning' | 'critical' {
    const progressDiff = goal.progress - goal.expectedProgress;
    
    if (progressDiff >= 10) return 'healthy';
    if (progressDiff >= -10) return 'warning';
    return 'critical';
  }

  // Get status color
  getStatusColor(status: Goal['status']): string {
    const colors = {
      'completed': 'bg-emerald-500',
      'in-progress': 'bg-blue-500',
      'not-started': 'bg-gray-500',
      'behind-schedule': 'bg-amber-500',
      'at-risk': 'bg-rose-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  // Get priority color
  getPriorityColor(priority: Goal['priority']): string {
    const colors = {
      'critical': 'bg-rose-500',
      'high': 'bg-amber-500',
      'medium': 'bg-blue-500',
      'low': 'bg-emerald-500'
    };
    return colors[priority] || 'bg-gray-500';
  }

  // Get category color
  getCategoryColor(category: Goal['category']): string {
    const colors = {
      'academic': 'bg-purple-500',
      'administrative': 'bg-blue-500',
      'social': 'bg-pink-500',
      'infrastructure': 'bg-amber-500',
      'other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  }
}

export const goalsService = new GoalsService();
export default goalsService;