import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAccounts } from '../../hooks/useAccounts';
import AccountListPage from './AccountListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useAccounts');
vi.mock('../../components/Accounts/DeleteAccountDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="delete-dialog"><button onClick={onClose}>Cancel</button></div> : null,
}));

const mockItems = [
  {
    id: 'a1',
    accountName: 'Acme Corp',
    industry: 'Technology',
    phone: '+1-555-0100',
  },
  {
    id: 'a2',
    accountName: 'Globex',
    industry: null,
    phone: null,
  },
];

describe('AccountListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useAccounts).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0100')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    vi.mocked(useAccounts).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('shows empty state when no accounts exist', () => {
    vi.mocked(useAccounts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    expect(screen.getByText(/no accounts yet/i)).toBeInTheDocument();
  });

  it('shows no-match message when search returns empty', () => {
    vi.useFakeTimers();
    vi.mocked(useAccounts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search accounts/i),
        { target: { value: 'xyz' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no accounts match your search/i)).toBeInTheDocument();
  });

  it('passes search term to useAccounts after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search accounts/i),
        { target: { value: 'acme' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useAccounts)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'acme' }),
    );
  });

  it('navigates to /accounts/new when Add Account is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /add account/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/accounts/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/accounts/a1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog', { name: 'delete-dialog' })).toBeInTheDocument();
  });

  it('calls useAccounts with next page when next-page button is clicked', async () => {
    vi.mocked(useAccounts).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><AccountListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useAccounts)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
