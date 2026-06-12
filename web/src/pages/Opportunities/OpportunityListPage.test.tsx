import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useOpportunities } from '../../hooks/useOpportunities';
import { OpportunityStage } from '../../api/opportunities';
import OpportunityListPage from './OpportunityListPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useOpportunities');
vi.mock('../../components/Opportunities/DeleteOpportunityDialog', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog" aria-label="delete-dialog"><button onClick={onClose}>Cancel</button></div> : null,
}));

const mockItems = [
  {
    id: 'o1',
    opportunityName: 'Big Deal',
    accountName: 'Acme Corp',
    stage: OpportunityStage.Proposal,
    expectedRevenue: 50000,
  },
  {
    id: 'o2',
    opportunityName: 'Small Deal',
    accountName: 'Globex',
    stage: OpportunityStage.Prospecting,
    expectedRevenue: null,
  },
];

describe('OpportunityListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(useOpportunities).mockReturnValue({
      data: { items: mockItems, total: 2, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders table rows from mock data', () => {
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    expect(screen.getByText('Big Deal')).toBeInTheDocument();
    expect(screen.getByText('Small Deal')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Proposal')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading', () => {
    vi.mocked(useOpportunities).mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    expect(screen.queryByText('Big Deal')).not.toBeInTheDocument();
  });

  it('shows empty state when no opportunities exist', () => {
    vi.mocked(useOpportunities).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    expect(screen.getByText(/no opportunities yet/i)).toBeInTheDocument();
  });

  it('shows no-match message when search returns empty', () => {
    vi.useFakeTimers();
    vi.mocked(useOpportunities).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search opportunities/i),
        { target: { value: 'xyz' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no opportunities match your search/i)).toBeInTheDocument();
  });

  it('passes search term to useOpportunities after debounce', () => {
    vi.useFakeTimers();

    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    act(() => {
      fireEvent.change(
        screen.getByPlaceholderText(/search opportunities/i),
        { target: { value: 'acme' } },
      );
      vi.advanceTimersByTime(300);
    });

    expect(vi.mocked(useOpportunities)).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'acme' }),
    );
  });

  it('navigates to /opportunities/new when Add Opportunity is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /add opportunity/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/opportunities/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/opportunities/o1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog', { name: 'delete-dialog' })).toBeInTheDocument();
  });

  it('calls useOpportunities with next page when next-page button is clicked', async () => {
    vi.mocked(useOpportunities).mockReturnValue({
      data: { items: mockItems, total: 25, page: 1, pageSize: 10 },
      isLoading: false,
    } as any);

    const user = userEvent.setup();
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    expect(vi.mocked(useOpportunities)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
