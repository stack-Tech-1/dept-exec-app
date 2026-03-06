import API from './api';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  totalMembers: number;
  upcomingMeetings: number;
  pendingMinutes: number;
  totalGoals?: number;
  activeGoals?: number;
}

export interface Task {
  id: string;
  _id?: string; // MongoDB native field — present when backend doesn't remap _id → id
  title: string;
  description: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'VERIFIED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completedAt?: string;
  statusHistory?: Array<{
    status: string;
    changedBy: { id: string; name: string };
    changedAt: string;
  }>;
  progress?: number;
  attachments?: Array<{ id: string; filename: string; url: string; uploadedAt: string }>;
  comments?: Array<{ id: string; text: string; author: { id: string; name: string; position: string }; createdAt: string }>;
  verifiedBy?: { id: string; name: string };
  verifiedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  minutesText?: string;
  recordingUrl?: string;
  approved: boolean;
  createdBy: { id: string; name: string };
  session?: string;
  semester?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BEHIND_SCHEDULE';
  createdBy: { id: string; name: string };
  tasks?: { completed: number; total: number };
}

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const raw = (await API.get('/reports/dashboard-summary')) as any;
    return {
      totalTasks:      raw.tasks?.total       ?? 0,
      completedTasks:  raw.tasks?.completed   ?? 0,
      overdueTasks:    raw.tasks?.overdue     ?? 0,
      pendingTasks:    raw.tasks?.pending     ?? 0,
      inProgressTasks: raw.tasks?.inProgress  ?? 0,
      totalMembers:    raw.users?.total       ?? 0,
      upcomingMeetings: raw.upcomingMeetings  ?? 0,
      pendingMinutes:  raw.pendingMinutes ?? 0,
      totalGoals:      raw.goals?.total       ?? 0,
      activeGoals:     raw.goals?.inProgress  ?? 0,
    };
  }

  // Get recent tasks
  async getRecentTasks(limit: number = 5): Promise<Task[]> {
    const raw = (await API.get('/tasks')) as unknown as any;
    const tasks: Task[] = Array.isArray(raw) ? raw : (raw?.tasks ?? raw?.data ?? []);

    // Sort by due date (soonest first) and limit
    return tasks
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, limit)
      .map(task => ({
        ...task,
        progress: this.calculateTaskProgress(task)
      }));
  }

  // Get upcoming meetings
  async getUpcomingMeetings(limit: number = 3): Promise<Meeting[]> {
    const raw = (await API.get('/meetings')) as unknown as any;
    const meetings: Meeting[] = Array.isArray(raw) ? raw : (raw?.meetings ?? raw?.data ?? []);
    const today = new Date();
    
    return meetings
      .filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  // Get goal progress
  async getGoalProgress(): Promise<Goal[]> {
    // Note: You'll need to create a goals backend endpoint
    // For now, returning mock data that matches your UI
    const goals: Goal[] = await API.get('/goals'); // Create this endpoint
    
    return goals.map(goal => ({
      ...goal,
      tasks: {
        completed: Math.floor((goal.progress / 100) * 20), // Assuming 20 tasks per goal
        total: 20
      }
    }));
  }

  // Helper: Calculate task progress based on status
  private calculateTaskProgress(task: Task): number {
    switch (task.status) {
      case 'COMPLETED':
        return 100;
      case 'IN_PROGRESS':
        return 50;
      case 'OVERDUE':
        return 90; // Almost done but overdue
      case 'PENDING':
        return 0;
      default:
        return 0;
    }
  }

  // Helper: Format date for UI
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Helper: Get time from now
  getTimeFromNow(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Past';
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    if (diffInDays < 30) return `In ${Math.floor(diffInDays / 7)} weeks`;
    return `In ${Math.floor(diffInDays / 30)} months`;
  }

  // Helper: Get priority color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Helper: Get status badge props
  getStatusBadgeProps(status: string) {
    switch (status) {
      case 'COMPLETED':
        return {
          className: 'bg-emerald-50 text-emerald-700',
          icon: 'CheckSquare',
          label: 'Completed'
        };
      case 'OVERDUE':
        return {
          className: 'bg-amber-50 text-amber-700',
          icon: 'AlertCircle',
          label: 'Overdue'
        };
      case 'IN_PROGRESS':
        return {
          className: 'bg-blue-50 text-blue-700',
          icon: 'Activity',
          label: 'In Progress'
        };
      case 'PENDING':
        return {
          className: 'bg-gray-50 text-gray-700',
          icon: 'Clock',
          label: 'Pending'
        };
      default:
        return {
          className: 'bg-gray-50 text-gray-700',
          icon: 'Clock',
          label: status
        };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;