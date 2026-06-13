import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTickets } from '../../hooks/useTickets';
import { TicketPriority, TicketStatus } from '../../api/tickets';
import TicketListPage from './TicketListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useTickets');
vi.mock('../../components/Tickets/DeleteTicketDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="delete-dialog"><button onClick={onClose}>Cancel</button></div> : null,
}));

const mockItems = [
  {
    id: 't1',
    ticketNumber: 'TKT-00001',
    subject: 'Login page broken',
    priority: TicketPriority.High,
    status: TicketStatus.Open,
  },
  {
    id: 't2',
    ticketNumber: 'TKT-00002',
    subject: 'Cannot export report',
    priority: TicketPriority.Medium,
    status: TicketStatus.InProgress,
  },
];

describe('TicketListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useTickets).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    expect(screen.getByText('TKT-00001')).toBeInTheDocument();
    expect(screen.getByText('Login page broken')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    vi.mocked(useTickets).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    expect(screen.queryByText('TKT-00001')).not.toBeInTheDocument();
  });

  it('shows empty state when no tickets exist', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    expect(screen.getByText(/no tickets yet/i)).toBeInTheDocument();
  });

  it('shows no-match message when search returns empty', () => {
    vi.useFakeTimers();
    vi.mocked(useTickets).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search tickets/i),
        { target: { value: 'xyz' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no tickets match your search/i)).toBeInTheDocument();
  });

  it('passes search term to useTickets after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search tickets/i),
        { target: { value: 'login' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useTickets)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'login' }),
    );
  });

  it('navigates to /tickets/new when Add Ticket is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /add ticket/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/tickets/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/tickets/t1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog', { name: 'delete-dialog' })).toBeInTheDocument();
  });

  it('calls useTickets with next page when next-page button is clicked', async () => {
    vi.mocked(useTickets).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><TicketListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useTickets)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
