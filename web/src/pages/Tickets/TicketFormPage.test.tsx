import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTicket, useCreateTicket, useUpdateTicket } from '../../hooks/useTickets';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';
import { TicketPriority, TicketStatus } from '../../api/tickets';
import TicketFormPage from './TicketFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useTickets');
vi.mock('../../hooks/useAccounts');
vi.mock('../../hooks/useContacts');

const mockTicket = {
  id: 'tkt-1',
  ticketNumber: 'TKT-00001',
  subject: 'Login page broken',
  accountId: null,
  accountName: null,
  contactId: null,
  contactName: null,
  priority: TicketPriority.High,
  status: TicketStatus.Open,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/tickets/new']}>
      <Routes>
        <Route path="/tickets/new" element={<TicketFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/tickets/tkt-1/edit']}>
      <Routes>
        <Route path="/tickets/:id/edit" element={<TicketFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TicketFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useTicket).mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.mocked(useCreateTicket).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateTicket).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
    vi.mocked(useAccounts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 100 },
    } as any);
    vi.mocked(useContacts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 100 },
    } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when ticket data loads', async () => {
    vi.mocked(useTicket).mockReturnValue({ data: mockTicket, isLoading: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/subject/i)).toHaveValue('Login page broken');
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('displays ticket number as read-only in edit mode', async () => {
    vi.mocked(useTicket).mockReturnValue({ data: mockTicket, isLoading: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByDisplayValue('TKT-00001')).toBeInTheDocument();
    });
  });

  it('shows validation error when Subject is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /create ticket/i }));

    expect(await screen.findByText(/subject is required/i)).toBeInTheDocument();
  });

  it('calls createTicket mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/subject/i), 'New issue');
    await user.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New issue',
        }),
        expect.any(Object),
      );
    });
  });

  it('calls updateTicket mutation with payload in edit mode', async () => {
    vi.mocked(useTicket).mockReturnValue({ data: mockTicket, isLoading: false } as any);
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/subject/i)).toHaveValue('Login page broken'));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'tkt-1',
          payload: expect.objectContaining({ subject: 'Login page broken' }),
        }),
        expect.any(Object),
      );
    });
  });

  it('shows loading spinner in edit mode while fetching', () => {
    vi.mocked(useTicket).mockReturnValue({ data: undefined, isLoading: true } as any);
    renderEdit();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });

  it('navigates back to /tickets when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/tickets');
  });
});
