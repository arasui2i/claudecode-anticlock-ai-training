import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useActivity, useCreateActivity, useUpdateActivity } from '../../hooks/useActivities';
import { ActivityType, ActivityStatus } from '../../api/activities';
import ActivityFormPage from './ActivityFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useActivities');

const mockActivity = {
  id: 'act-1',
  subject: 'Follow up call',
  activityType: ActivityType.Call,
  dueDate: '2026-12-31T00:00:00Z',
  status: ActivityStatus.Open,
  assignedTo: null,
  assignedUserName: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/activities/new']}>
      <Routes>
        <Route path="/activities/new" element={<ActivityFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/activities/act-1/edit']}>
      <Routes>
        <Route path="/activities/:id/edit" element={<ActivityFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ActivityFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useActivity).mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.mocked(useCreateActivity).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateActivity).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create activity/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when activity data loads', async () => {
    vi.mocked(useActivity).mockReturnValue({ data: mockActivity, isLoading: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/subject/i)).toHaveValue('Follow up call');
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when Subject is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /create activity/i }));

    expect(await screen.findByText(/subject is required/i)).toBeInTheDocument();
  });

  it('shows validation error when Due Date is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/subject/i), 'Test activity');
    await user.click(screen.getByRole('button', { name: /create activity/i }));

    expect(await screen.findByText(/due date is required/i)).toBeInTheDocument();
  });

  it('calls createActivity mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/subject/i), 'Test activity');
    await user.type(screen.getByLabelText(/due date/i), '2026-12-31');
    await user.click(screen.getByRole('button', { name: /create activity/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Test activity',
          dueDate: '2026-12-31',
        }),
        expect.any(Object),
      );
    });
  });

  it('calls updateActivity mutation with payload in edit mode', async () => {
    vi.mocked(useActivity).mockReturnValue({ data: mockActivity, isLoading: false } as any);
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/subject/i)).toHaveValue('Follow up call'));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'act-1',
          payload: expect.objectContaining({ subject: 'Follow up call' }),
        }),
        expect.any(Object),
      );
    });
  });

  it('shows loading spinner in edit mode while fetching', () => {
    vi.mocked(useActivity).mockReturnValue({ data: undefined, isLoading: true } as any);
    renderEdit();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });

  it('navigates back to /activities when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/activities');
  });
});
