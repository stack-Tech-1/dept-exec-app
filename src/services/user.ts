// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\services\user.ts
import API from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EXEC';
  position: string;
  department?: string;
  bio?: string;
  phone?: string;
  matricNumber?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class UserService {
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    return API.get('/users');
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    return API.get(`/users/${id}`);
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    return API.get('/users/profile');
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return API.put('/users/profile', data);
  }

  // Update user (admin only)
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return API.put(`/users/${id}`, data);
  }

  // Deactivate user (admin only)
  async deactivateUser(id: string): Promise<void> {
    return API.delete(`/users/${id}`);
  }

  // Reactivate user (admin only)
  async reactivateUser(id: string): Promise<User> {
    return API.post(`/users/${id}/reactivate`);
  }

  // Get user statistics
  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    admins: number;
    execs: number;
    byPosition: Record<string, number>;
  }> {
    return API.get('/users/statistics');
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    return API.get('/users/search', { params: { query } });
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return API.post('/users/change-password', { oldPassword, newPassword });
  }
}

export const userService = new UserService();
export default userService;