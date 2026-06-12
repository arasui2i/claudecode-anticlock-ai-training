import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useLeads } from '../../hooks/useLeads';
import { LeadStatus } from '../../api/leads';
import LeadListPage from './LeadListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useLeads');
vi.mock('../../components/Leads/DeleteLeadDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="delete-dialog"><button onClick={onClose}>Cancel</button></div> : null,
}));

const mockItems = [
  {
    id: 'l1',
    fullName: 'Jane Doe',
    companyName: 'Acme Corp',
    email: 'jane@example.com',
    status: LeadStatus.Qualified,
  },
  {
    id: 'l2',
    fullName: 'Bob Smith',
    companyName: 'Globex',
    email: 'bob@example.com',
    status: LeadStatus.New,
  },
];

describe('LeadListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useLeads).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    vi.mocked(useLeads).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('shows empty state when no leads exist', () => {
    vi.mocked(useLeads).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    expect(screen.getByText(/no leads yet/i)).toBeInTheDocument();
  });

  it('shows no-match message when search returns empty', () => {
    vi.useFakeTimers();
    vi.mocked(useLeads).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search leads/i),
        { target: { value: 'xyz' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no leads match your search/i)).toBeInTheDocument();
  });

  it('passes search term to useLeads after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search leads/i),
        { target: { value: 'acme' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useLeads)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'acme' }),
    );
  });

  it('navigates to /leads/new when Add Lead is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /add lead/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/leads/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/leads/l1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog', { name: 'delete-dialog' })).toBeInTheDocument();
  });

  it('calls useLeads with next page when next-page button is clicked', async () => {
    vi.mocked(useLeads).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><LeadListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useLeads)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
