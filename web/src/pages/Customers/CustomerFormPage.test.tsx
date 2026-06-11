import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCreateCustomer, useCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import { CustomerStatus, Gender } from '../../api/customers';
import CustomerFormPage from './CustomerFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useCustomers');

const mockCustomer = {
  id: 'customer-1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  company: 'ACME',
  jobTitle: 'Engineer',
  phoneNumber: '555-0100',
  industry: 'Tech',
  headquartersAddress: '1 Main St',
  status: CustomerStatus.Active,
  gender: Gender.Female,
  age: 30,
  annualIncome: 90000,
  employeeCount: 200,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/customers/new']}>
      <Routes>
        <Route path="/customers/new" element={<CustomerFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/customers/customer-1/edit']}>
      <Routes>
        <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CustomerFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useCustomer).mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
    vi.mocked(useCreateCustomer).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateCustomer).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create customer/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when customer data loads', async () => {
    vi.mocked(useCustomer).mockReturnValue({ data: mockCustomer, isLoading: false, isError: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue('Alice');
    });
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('calls createCustomer mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Alice');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'alice@example.com');
    await user.click(screen.getByRole('button', { name: /create customer/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
        }),
        expect.any(Object),
      );
    });
  });

  it('sets email field error on 409 conflict response', async () => {
    const error409 = Object.assign(new Error('Conflict'), {
      isAxiosError: true,
      response: { status: 409 },
    });
    mockCreateMutate.mockImplementation((_payload: any, options: any) => {
      options.onError(error409);
    });

    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Alice');
    await user.type(screen.getByLabelText(/last name/i), 'Smith');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'alice@example.com');
    await user.click(screen.getByRole('button', { name: /create customer/i }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });
});
