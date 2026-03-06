import API from './api';
import { Task } from './dashboard';

export interface CreateTaskData {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UpdateTaskStatusData {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

class TasksService {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    return API.get('/tasks');
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task> {
    return API.get(`/tasks/${id}`);
  }

  // Create a new task
  async createTask(data: CreateTaskData): Promise<Task> {
    return API.post('/tasks', data);
  }

  // Update task status
  async updateTaskStatus(id: string, status: UpdateTaskStatusData): Promise<Task> {
    return API.patch(`/tasks/${id}/status`, status);
  }

  // Delete task (admin only)
  async deleteTask(id: string): Promise<{ message: string }> {
    return API.delete(`/tasks/${id}`);
  }

  // Upload attachment to a task
  async uploadAttachment(taskId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return API.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Add comment to a task
  async addComment(taskId: string, text: string): Promise<any> {
    return API.post(`/tasks/${taskId}/comments`, { text });
  }

  // Update task progress (0–100)
  async updateProgress(taskId: string, progress: number): Promise<any> {
    return API.patch(`/tasks/${taskId}/progress`, { progress });
  }

  // Verify a completed task (admin only)
  async verifyTask(taskId: string): Promise<any> {
    return API.post(`/tasks/${taskId}/verify`);
  }

  // Get tasks assigned to current user
  async getMyTasks(): Promise<Task[]> {
    const tasks = await this.getTasks();
    const user = JSON.parse(localStorage.getItem('dept_exec_user') || '{}');
    return tasks.filter(task => task.assignedTo.id === user.id);
  }

  // Get tasks created by current user
  async getTasksICreated(): Promise<Task[]> {
    const tasks = await this.getTasks();
    const user = JSON.parse(localStorage.getItem('dept_exec_user') || '{}');
    return tasks.filter(task => task.createdBy.id === user.id);
  }

  // Get overdue tasks
  async getOverdueTasks(): Promise<Task[]> {
    const tasks = await this.getTasks();
    const now = new Date();
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== 'COMPLETED';
    });
  }
}

export const tasksService = new TasksService();
export default tasksService;