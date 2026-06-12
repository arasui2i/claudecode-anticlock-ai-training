import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useContacts } from '../../hooks/useContacts';
import ContactListPage from './ContactListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useContacts');
vi.mock('../../components/Contacts/DeleteContactDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="delete-dialog"><button onClick={onClose}>Cancel</button></div> : null,
}));

const mockItems = [
  {
    id: 'c1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-0100',
  },
  {
    id: 'c2',
    fullName: 'Bob Smith',
    email: 'bob@example.com',
    phone: null,
  },
];

describe('ContactListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useContacts).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    vi.mocked(useContacts).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('shows empty state when no contacts exist', () => {
    vi.mocked(useContacts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
  });

  it('shows no-match message when search returns empty', () => {
    vi.useFakeTimers();
    vi.mocked(useContacts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search contacts/i),
        { target: { value: 'xyz' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no contacts match your search/i)).toBeInTheDocument();
  });

  it('passes search term to useContacts after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search contacts/i),
        { target: { value: 'jane' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useContacts)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'jane' }),
    );
  });

  it('navigates to /contacts/new when Add Contact is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /add contact/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/contacts/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/contacts/c1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog', { name: 'delete-dialog' })).toBeInTheDocument();
  });

  it('calls useContacts with next page when next-page button is clicked', async () => {
    vi.mocked(useContacts).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><ContactListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useContacts)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
