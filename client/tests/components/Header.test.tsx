import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../../components/Header';
import * as api from '@/lib/api';

vi.mock('@/lib/api');

const mockGetCurrentUser = api.getCurrentUser as ReturnType<typeof vi.fn>;

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays user name when loaded', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_123',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    mockGetCurrentUser.mockResolvedValue({ user: mockUser });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeInTheDocument();
    });
  });

  it('shows dropdown with Subscribe button when user is not subscribed', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      subscriptionStatus: 'inactive',
      stripeCustomerId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    mockGetCurrentUser.mockResolvedValue({ user: mockUser });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Subscribe to Premium')).toBeInTheDocument();
    });
  });

  it('shows dropdown with Manage Subscription button when user is subscribed', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_123',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    mockGetCurrentUser.mockResolvedValue({ user: mockUser });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Manage Subscription')).toBeInTheDocument();
    });
  });

  it('shows subscription status as Active in dropdown', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_123',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    mockGetCurrentUser.mockResolvedValue({ user: mockUser });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('shows subscription status as Inactive in dropdown', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'demo@example.com',
      name: 'Demo User',
      subscriptionStatus: 'inactive',
      stripeCustomerId: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    mockGetCurrentUser.mockResolvedValue({ user: mockUser });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });
});
