// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\services\reports.ts
import API from './api';

export interface TaskReport {
  total: number;
  completed: number;
  overdue: number;
  pending: number;
  inProgress: number;
  completionRate: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  byAssignee: Array<{
    assigneeId: string;
    assigneeName: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
  }>;
  averageCompletionTime: number; // in days
  weeklyTrend: Array<{
    week: string;
    created: number;
    completed: number;
  }>;
}

export interface MeetingReport {
  total: number;
  upcoming: number;
  past: number;
  byType: Record<string, number>;
  attendanceRate: number;
  byMonth: Array<{
    month: string;
    count: number;
    attendance: number;
  }>;
  rsvpStats: {
    attending: number;
    notAttending: number;
    maybe: number;
    pending: number;
  };
}

export interface GoalReport {
  total: number;
  completed: number;
  inProgress: number;
  atRisk: number;
  averageProgress: number;
  byCategory: Record<string, { count: number; avgProgress: number }>;
  byPriority: Record<string, number>;
  upcomingDeadlines: number;
  budgetUtilization: {
    totalAllocated: number;
    totalSpent: number;
    utilizationRate: number;
  };
}

export interface UserPerformance {
  userId: string;
  userName: string;
  userPosition: string;
  taskStats: {
    assigned: number;
    completed: number;
    completionRate: number;
    overdue: number;
    averageCompletionTime: number;
  };
  meetingStats: {
    invited: number;
    attended: number;
    attendanceRate: number;
    punctuality: number; // % of meetings attended on time
  };
  goalStats: {
    assigned: number;
    completed: number;
    averageProgress: number;
    contributions: number; // tasks contributed to goals
  };
  overallScore: number;
}

export interface DepartmentReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalTasks: number;
    totalMeetings: number;
    totalGoals: number;
    overallProductivity: number;
    departmentHealth: 'excellent' | 'good' | 'fair' | 'poor';
  };
  taskReport: TaskReport;
  meetingReport: MeetingReport;
  goalReport: GoalReport;
  topPerformers: UserPerformance[];
  areasOfImprovement: string[];
  recommendations: string[];
}

class ReportsService {
  // Get task analytics report
  async getTaskReport(startDate?: string, endDate?: string): Promise<TaskReport> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return API.get('/reports/tasks', { params });
  }

  // Get meeting analytics report
  async getMeetingReport(startDate?: string, endDate?: string): Promise<MeetingReport> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return API.get('/reports/meetings', { params });
  }

  // Get goal analytics report
  async getGoalReport(): Promise<GoalReport> {
    return API.get('/reports/goals');
  }

  // Get user performance reports
  async getUserPerformance(userId?: string): Promise<UserPerformance | UserPerformance[]> {
    const url = userId ? `/reports/users/${userId}` : '/reports/users';
    return API.get(url);
  }

  // Get comprehensive department report
  async getDepartmentReport(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DepartmentReport> {
    return API.get('/reports/department', { params: { period } });
  }

  // Export report to PDF
  async exportReport(reportType: 'tasks' | 'meetings' | 'goals' | 'department', format: 'pdf' | 'csv' = 'pdf'): Promise<Blob> {
    return API.get(`/reports/export/${reportType}`, {
      params: { format },
      responseType: 'blob',
    });
  }

  // Get dashboard summary (for quick stats)
  async getDashboardSummary(): Promise<{
    tasks: {
      total: number;
      completedToday: number;
      overdue: number;
      completionRate: number;
    };
    meetings: {
      upcomingThisWeek: number;
      attendanceRate: number;
    };
    goals: {
      active: number;
      atRisk: number;
      averageProgress: number;
    };
    users: {
      active: number;
      topPerformer: string;
    };
  }> {
    return API.get('/reports/dashboard-summary');
  }
}

export const reportsService = new ReportsService();
export default reportsService;