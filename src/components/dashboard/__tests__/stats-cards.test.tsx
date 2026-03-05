import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}));

// Mock dashboardService
vi.mock('@/services/dashboard', () => ({
  dashboardService: {
    getDashboardStats: vi.fn(),
  },
}));

// Mock authService
vi.mock('@/services/auth', () => ({
  authService: {
    isAdmin: vi.fn(() => false),
  },
}));

import DashboardStats from '../stats-cards';
import { dashboardService } from '@/services/dashboard';

const mockStats = {
  totalTasks: 10,
  completedTasks: 4,
  overdueTasks: 2,
  pendingTasks: 3,
  inProgressTasks: 1,
  totalMembers: 12,
  upcomingMeetings: 3,
  pendingMinutes: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardStats', () => {
  it('shows skeletons while loading', () => {
    vi.mocked(dashboardService.getDashboardStats).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<DashboardStats />);
    // Should have skeleton cards (animate-pulse divs)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders stat cards after data loads', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockResolvedValueOnce(mockStats);
    render(<DashboardStats />);

    await waitFor(() => {
      expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/overdue tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/total members/i)).toBeInTheDocument();
  });

  it('falls back to default stats when API fails', async () => {
    vi.mocked(dashboardService.getDashboardStats).mockRejectedValueOnce(new Error('Network error'));
    render(<DashboardStats />);

    await waitFor(() => {
      expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    });
  });
});
