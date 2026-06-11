import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCustomer } from '../../hooks/useCustomers';
import { useAuth } from '../../context/AuthContext';
import { CustomerStatus, Gender } from '../../api/customers';
import CustomerDetailPage from './CustomerDetailPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useCustomers');
vi.mock('../../context/AuthContext');

// Controllable mock: when open, exposes buttons that trigger onDeleted / onClose
vi.mock('../../components/Customers/DeleteConfirmDialog', () => ({
  default: ({ open, onDeleted, onClose }: any) =>
    open ? (
      <>
        <button onClick={onDeleted}>Confirm Delete</button>
        <button onClick={onClose}>Cancel Delete</button>
      </>
    ) : null,
}));

const mockCustomer = {
  id: 'customer-1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  company: 'ACME',
  status: CustomerStatus.Active,
  jobTitle: 'Engineer',
  gender: Gender.Female,
  age: 30,
  phoneNumber: '555-0100',
  industry: 'Tech',
  annualIncome: 90000,
  employeeCount: 200,
  headquartersAddress: '1 Main St',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/customers/customer-1']}>
      <Routes>
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CustomerDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useCustomer).mockReturnValue({ data: mockCustomer, isLoading: false, isError: false } as any);
    vi.mocked(useAuth).mockReturnValue({ roles: ['Admin'] } as any);
  });

  it('renders customer fields', () => {
    renderPage();

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('1 Main St')).toBeInTheDocument();
  });

  it('shows delete button for Admin role', () => {
    vi.mocked(useAuth).mockReturnValue({ roles: ['Admin'] } as any);
    renderPage();

    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('hides delete button for non-Admin role', () => {
    vi.mocked(useAuth).mockReturnValue({ roles: ['User'] } as any);
    renderPage();

    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
  });

  it('navigates to /customers after successful delete', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/customers');
  });
});
