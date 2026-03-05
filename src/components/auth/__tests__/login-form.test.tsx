import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock authService
vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
  },
}));

import LoginForm from '../login-form';
import { authService } from '@/services/auth';

beforeEach(() => {
  vi.clearAllMocks();
  // Mock document.cookie setter
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
  localStorage.clear();
});

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/department email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /access executive portal/i })).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({ message: 'Invalid credentials' });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/department email/i), 'bad@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /access executive portal/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('calls authService.login with entered credentials', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', name: 'Test', email: 'test@uni.edu', role: 'EXEC', position: 'President' },
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/department email/i), 'test@uni.edu');
    await userEvent.type(screen.getByLabelText(/password/i), 'mypassword');
    fireEvent.click(screen.getByRole('button', { name: /access executive portal/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@uni.edu',
        password: 'mypassword',
      });
    });
  });

  it('disables the submit button while loading', async () => {
    // Make login hang so we can observe the loading state
    vi.mocked(authService.login).mockImplementationOnce(() => new Promise(() => {}));

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/department email/i), 'test@uni.edu');
    await userEvent.type(screen.getByLabelText(/password/i), 'pass');
    fireEvent.click(screen.getByRole('button', { name: /access executive portal/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /authenticating/i })).toBeDisabled();
    });
  });
});
