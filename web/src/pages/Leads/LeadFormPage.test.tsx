import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCreateLead, useLead, useUpdateLead } from '../../hooks/useLeads';
import { LeadStatus } from '../../api/leads';
import LeadFormPage from './LeadFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useLeads');

const mockLead = {
  id: 'lead-1',
  firstName: 'Jane',
  lastName: 'Doe',
  companyName: 'Acme Corp',
  email: 'jane@example.com',
  phone: '555-0100',
  status: LeadStatus.Qualified,
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/leads/new']}>
      <Routes>
        <Route path="/leads/new" element={<LeadFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/leads/lead-1/edit']}>
      <Routes>
        <Route path="/leads/:id/edit" element={<LeadFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LeadFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useLead).mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
    vi.mocked(useCreateLead).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateLead).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create lead/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when lead data loads', async () => {
    vi.mocked(useLead).mockReturnValue({ data: mockLead, isLoading: false, isError: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
    });
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when First Name is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /create lead/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
  });

  it('shows validation error when Company is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.click(screen.getByRole('button', { name: /create lead/i }));

    expect(await screen.findByText(/company name is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/company/i), 'Acme');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /create lead/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it('calls createLead mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/company/i), 'Acme Corp');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /create lead/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          companyName: 'Acme Corp',
          email: 'jane@example.com',
        }),
        expect.any(Object),
      );
    });
  });

  it('calls updateLead mutation with payload in edit mode', async () => {
    vi.mocked(useLead).mockReturnValue({ data: mockLead, isLoading: false, isError: false } as any);
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane'));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'lead-1',
          payload: expect.objectContaining({
            firstName: 'Jane',
            email: 'jane@example.com',
          }),
        }),
        expect.any(Object),
      );
    });
  });

  it('navigates back to /leads when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/leads');
  });
});
