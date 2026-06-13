import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useActivities } from '../../hooks/useActivities';
import { ActivityType, ActivityStatus } from '../../api/activities';
import ActivityListPage from './ActivityListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useActivities');
vi.mock('../../components/Activities/DeleteActivityDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="delete-dialog"><button onClick={onClose}>Cancel</button></div> : null,
}));

const mockItems = [
  {
    id: 'a1',
    subject: 'Follow up call',
    activityType: ActivityType.Call,
    dueDate: '2026-12-31T00:00:00Z',
    status: ActivityStatus.Open,
  },
  {
    id: 'a2',
    subject: 'Send proposal',
    activityType: ActivityType.Email,
    dueDate: '2026-11-15T00:00:00Z',
    status: ActivityStatus.InProgress,
  },
];

describe('ActivityListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useActivities).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    expect(screen.getByText('Follow up call')).toBeInTheDocument();
    expect(screen.getByText('Send proposal')).toBeInTheDocument();
    expect(screen.getByText('Call')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    vi.mocked(useActivities).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    expect(screen.queryByText('Follow up call')).not.toBeInTheDocument();
  });

  it('shows empty state when no activities exist', () => {
    vi.mocked(useActivities).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    expect(screen.getByText(/no activities yet/i)).toBeInTheDocument();
  });

  it('shows no-match message when search returns empty', () => {
    vi.useFakeTimers();
    vi.mocked(useActivities).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search activities/i),
        { target: { value: 'xyz' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no activities match your search/i)).toBeInTheDocument();
  });

  it('passes search term to useActivities after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search activities/i),
        { target: { value: 'call' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useActivities)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'call' }),
    );
  });

  it('navigates to /activities/new when Add Activity is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /add activity/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/activities/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/activities/a1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog', { name: 'delete-dialog' })).toBeInTheDocument();
  });

  it('calls useActivities with next page when next-page button is clicked', async () => {
    vi.mocked(useActivities).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><ActivityListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useActivities)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
