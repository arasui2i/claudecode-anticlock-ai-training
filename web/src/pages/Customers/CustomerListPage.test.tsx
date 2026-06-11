import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCustomers } from '../../hooks/useCustomers';
import { useAuth } from '../../context/AuthContext';
import { CustomerStatus } from '../../api/customers';
import CustomerListPage from './CustomerListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useCustomers');
vi.mock('../../context/AuthContext');
vi.mock('../../components/Customers/DeleteConfirmDialog', () => ({
  default: () => null,
}));

const mockItems = [
  {
    id: 'c1',
    firstName: 'Alice',
    lastName: 'Smith',
    company: 'ACME',
    email: 'alice@example.com',
    status: CustomerStatus.Active,
    jobTitle: 'Engineer',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    firstName: 'Bob',
    lastName: 'Jones',
    company: null,
    email: 'bob@example.com',
    status: CustomerStatus.Lead,
    jobTitle: null,
    createdAt: '2026-02-01T00:00:00Z',
  },
];

describe('CustomerListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useCustomers).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
    vi.mocked(useAuth).mockReturnValue({ roles: ['Admin'] } as any);
  });

  // Restore real timers after every test so fake timers from one test
  // don't leak into the next and cause userEvent to hang.
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><CustomerListPage /></MemoryRouter>);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('passes search term to useCustomers after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><CustomerListPage /></MemoryRouter>);

    // Use fireEvent (synchronous) to avoid userEvent + fake-timer deadlock
    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search customers/i),
        { target: { value: 'alice' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useCustomers)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'alice' }),
    );
  });

  it('calls useCustomers with next page when next-page button is clicked', async () => {
    vi.mocked(useCustomers).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><CustomerListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useCustomers)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it('hides delete buttons for non-admin users', () => {
    vi.mocked(useAuth).mockReturnValue({ roles: [] } as any);
    render(<MemoryRouter><CustomerListPage /></MemoryRouter>);

    expect(screen.queryAllByRole('button', { name: /^delete$/i })).toHaveLength(0);
  });
});
