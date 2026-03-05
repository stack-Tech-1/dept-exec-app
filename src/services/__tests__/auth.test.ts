import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API module so tests don't make real HTTP calls
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import { authService } from '../auth';
import API from '../api';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@uni.edu',
  role: 'ADMIN' as const,
  position: 'President' as const,
};

beforeEach(() => {
  // Reset localStorage before each test
  localStorage.clear();
  vi.clearAllMocks();
});

describe('authService.getCurrentUser()', () => {
  it('returns null when localStorage is empty', () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('returns parsed user when stored in localStorage', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify(mockUser));
    expect(authService.getCurrentUser()).toEqual(mockUser);
  });

  it('returns null when localStorage contains invalid JSON', () => {
    localStorage.setItem('dept_exec_user', 'not-valid-json');
    expect(authService.getCurrentUser()).toBeNull();
  });
});

describe('authService.getToken()', () => {
  it('returns null when no token is stored', () => {
    expect(authService.getToken()).toBeNull();
  });

  it('returns token when stored', () => {
    localStorage.setItem('dept_exec_token', 'my-test-token');
    expect(authService.getToken()).toBe('my-test-token');
  });
});

describe('authService.isAuthenticated()', () => {
  it('returns false when no token exists', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('returns true when token exists', () => {
    localStorage.setItem('dept_exec_token', 'some-token');
    expect(authService.isAuthenticated()).toBe(true);
  });
});

describe('authService.hasRole()', () => {
  it('returns false when no user is stored', () => {
    expect(authService.hasRole('ADMIN')).toBe(false);
  });

  it('returns true when user has the given role', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify(mockUser));
    expect(authService.hasRole('ADMIN')).toBe(true);
  });

  it('returns false when user has a different role', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify({ ...mockUser, role: 'EXEC' }));
    expect(authService.hasRole('ADMIN')).toBe(false);
  });
});

describe('authService.isAdmin()', () => {
  it('returns true for ADMIN role', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify(mockUser));
    expect(authService.isAdmin()).toBe(true);
  });

  it('returns false for EXEC role', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify({ ...mockUser, role: 'EXEC' }));
    expect(authService.isAdmin()).toBe(false);
  });
});

describe('authService.isExec()', () => {
  it('returns true for EXEC role', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify({ ...mockUser, role: 'EXEC' }));
    expect(authService.isExec()).toBe(true);
  });

  it('returns false for ADMIN role', () => {
    localStorage.setItem('dept_exec_user', JSON.stringify(mockUser));
    expect(authService.isExec()).toBe(false);
  });
});

describe('authService.initializeAuth()', () => {
  it('returns null user and token when nothing is stored', () => {
    expect(authService.initializeAuth()).toEqual({ user: null, token: null });
  });

  it('returns stored user and token', () => {
    localStorage.setItem('dept_exec_token', 'abc123');
    localStorage.setItem('dept_exec_user', JSON.stringify(mockUser));
    const result = authService.initializeAuth();
    expect(result.token).toBe('abc123');
    expect(result.user).toEqual(mockUser);
  });
});

describe('authService.login()', () => {
  it('calls the API and returns token and user', async () => {
    const mockResponse = { token: 'new-token', user: mockUser };
    vi.mocked(API.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.login({ email: 'test@uni.edu', password: 'pass' });
    expect(API.post).toHaveBeenCalledWith('/auth/login', { email: 'test@uni.edu', password: 'pass' });
    expect(result).toEqual(mockResponse);
  });

  it('throws when the API call fails', async () => {
    vi.mocked(API.post).mockRejectedValueOnce(new Error('Invalid credentials'));
    await expect(authService.login({ email: 'bad@test.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});
