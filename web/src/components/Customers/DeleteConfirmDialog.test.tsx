import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDeleteCustomer } from '../../hooks/useCustomers';
import { CustomerStatus } from '../../api/customers';
import DeleteConfirmDialog from './DeleteConfirmDialog';

vi.mock('../../hooks/useCustomers');

const mockCustomer = {
  id: 'customer-1',
  firstName: 'Alice',
  lastName: 'Smith',
  company: 'ACME',
  email: 'alice@example.com',
  status: CustomerStatus.Active,
  jobTitle: 'Engineer',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('DeleteConfirmDialog', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    mockMutate.mockClear();
    vi.mocked(useDeleteCustomer).mockReturnValue({ mutate: mockMutate, isPending: false } as any);
  });

  it('calls onClose without mutating when Cancel is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        open={true}
        customer={mockCustomer}
        onClose={mockOnClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls deleteCustomer with the customer id when Delete is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        open={true}
        customer={mockCustomer}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(mockMutate).toHaveBeenCalledWith('customer-1', expect.any(Object));
  });

  it('shows CircularProgress while deletion is pending', () => {
    vi.mocked(useDeleteCustomer).mockReturnValue({ mutate: vi.fn(), isPending: true } as any);

    render(
      <DeleteConfirmDialog
        open={true}
        customer={mockCustomer}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
