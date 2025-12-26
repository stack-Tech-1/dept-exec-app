import API from './api';

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EXEC';
  department?: string;
  position: 'President' | 'Vice President' | 'General Secretary' | 
            'Assistant General Secretary' | 'Treasurer' | 
            'Public Relations Officer' | 'Sports Director' |
            'Assistant Sports Director' | 'Social Director' |
            'Financial Secretary' | 'Executive Member';
  lastLogin?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  token: string;
  name: string;
  password: string;
}

export interface InviteData {
    email: string;
    role: 'ADMIN' | 'EXEC';
    position: 'President' | 'Vice President' | 'General Secretary' | 
            'Assistant General Secretary' | 'Treasurer' | 
            'Public Relations Officer' | 'Sports Director' |
            'Assistant Sports Director' | 'Social Director' |
            'Financial Secretary' | 'Executive Member'; 
  }  

class AuthService {
  // Login
  async login(data: LoginData): Promise<{ token: string; user: User }> {
    return API.post('/auth/login', data);
  }

  // Register with invite token
  async registerWithInvite(data: RegisterData): Promise<{ message: string }> {
    return API.post('/auth/register', data);
  }

  // Admin: Send invite
  async sendInvite(data: InviteData): Promise<{ message: string }> {
    return API.post('/auth/invite', data);
  }

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('dept_exec_token');
      localStorage.removeItem('dept_exec_user');
      
      // Clear cookies
      document.cookie = 'dept_exec_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'dept_exec_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      window.location.href = '/login';
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('dept_exec_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // Get token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('dept_exec_token');
  }

  // Check authentication
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Optional: Add token expiration check here
    return true;
  }

  // Check role
  hasRole(role: 'ADMIN' | 'EXEC'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Check if exec
  isExec(): boolean {
    return this.hasRole('EXEC');
  }

  // Initialize auth state (for SSR/SSG)
  initializeAuth(): { user: User | null; token: string | null } {
    return {
      user: this.getCurrentUser(),
      token: this.getToken(),
    };
  }
}

export const authService = new AuthService();
export default authService;