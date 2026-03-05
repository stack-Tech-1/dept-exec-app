import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
}));

// Mock authService
vi.mock('@/services/auth', () => ({
  authService: {
    initializeAuth: vi.fn(() => ({ user: null, token: null })),
    login: vi.fn(),
    logout: vi.fn(),
    isAdmin: vi.fn(() => false),
    isExec: vi.fn(() => false),
  },
}));

import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '@/services/auth';

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="is-admin">{String(auth.isAdmin)}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockPush.mockClear();
});

describe('AuthProvider', () => {
  it('renders children', () => {
    render(
      <AuthProvider>
        <span>Hello</span>
      </AuthProvider>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('provides unauthenticated state by default', async () => {
    vi.mocked(authService.initializeAuth).mockReturnValueOnce({ user: null, token: null });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('provides authenticated state when user is stored', async () => {
    const mockUser = {
      id: '1', name: 'Test User', email: 'test@uni.edu',
      role: 'ADMIN' as const, position: 'President' as const,
    };
    vi.mocked(authService.initializeAuth).mockReturnValueOnce({ user: mockUser, token: 'token123' });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress the error output in test console
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
