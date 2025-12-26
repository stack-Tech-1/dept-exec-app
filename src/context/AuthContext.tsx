'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService, User } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isExec: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const { user, token } = authService.initializeAuth();
      setUser(user);
      setToken(token);
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Auto-redirect if not authenticated
  useEffect(() => {
    // Don't redirect from these public routes
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname.includes(route));
 
    if (!loading && !user && !isPublicRoute) {
        router.push('/login');
    }
    }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });
      
      localStorage.setItem('dept_exec_token', result.token);
      localStorage.setItem('dept_exec_user', JSON.stringify(result.user));
      
      setUser(result.user);
      setToken(result.token);
      
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: authService.isAdmin(),
    isExec: authService.isExec(),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}