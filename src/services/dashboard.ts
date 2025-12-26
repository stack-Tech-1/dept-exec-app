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
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completedAt?: string;
  statusHistory?: Array<{
    status: string;
    changedBy: { id: string; name: string };
    changedAt: string;
  }>;
  progress?: number;
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
    // Since backend doesn't have a dedicated stats endpoint,
    // we'll calculate from existing data
    const [tasksRes, meetingsRes, usersRes] = await Promise.all([
        API.get<Task[]>('/tasks'),
        API.get<Meeting[]>('/minutes'),
        API.get<any[]>('/users') 
      ]);

    const tasks = tasksRes.data;
    const meetings = meetingsRes.data;
    const users = usersRes.data;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: Task) => t.status === 'COMPLETED').length;
    const overdueTasks = tasks.filter((t: Task) => t.status === 'OVERDUE').length;
    const pendingTasks = tasks.filter((t: Task) => t.status === 'PENDING').length;
    const inProgressTasks = tasks.filter((t: Task) => t.status === 'IN_PROGRESS').length;
    
    const pendingMinutes = meetings.filter((m: Meeting) => !m.approved).length;
    const upcomingMeetings = meetings.filter((m: Meeting) => {
      const meetingDate = new Date(m.date);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return meetingDate >= today && meetingDate <= nextWeek;
    }).length;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      pendingTasks,
      inProgressTasks,
      totalMembers: users.length,
      upcomingMeetings,
      pendingMinutes,
    };
  }

  // Get recent tasks
  async getRecentTasks(limit: number = 5): Promise<Task[]> {
    const tasks: Task[] = await API.get('/tasks');
    
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
    const meetings: Meeting[] = await API.get('/minutes');
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