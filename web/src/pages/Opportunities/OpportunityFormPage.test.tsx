import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useOpportunity, useCreateOpportunity, useUpdateOpportunity } from '../../hooks/useOpportunities';
import { useAccounts } from '../../hooks/useAccounts';
import { useContacts } from '../../hooks/useContacts';
import { OpportunityStage } from '../../api/opportunities';
import OpportunityFormPage from './OpportunityFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useOpportunities');
vi.mock('../../hooks/useAccounts');
vi.mock('../../hooks/useContacts');

const mockOpportunity = {
  id: 'opp-1',
  opportunityName: 'Big Deal',
  accountId: 'acc-1',
  accountName: 'Acme Corp',
  contactId: null,
  contactName: null,
  stage: OpportunityStage.Proposal,
  expectedRevenue: 50000,
  closeDate: '2026-12-31T00:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/opportunities/new']}>
      <Routes>
        <Route path="/opportunities/new" element={<OpportunityFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/opportunities/opp-1/edit']}>
      <Routes>
        <Route path="/opportunities/:id/edit" element={<OpportunityFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OpportunityFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useOpportunity).mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.mocked(useCreateOpportunity).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateOpportunity).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
    vi.mocked(useAccounts).mockReturnValue({
      data: { items: [{ id: 'acc-1', accountName: 'Acme Corp', industry: null, phone: null }], total: 1, page: 1, pageSize: 100 },
    } as any);
    vi.mocked(useContacts).mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 100 },
    } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create opportunity/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/opportunity name/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when opportunity data loads', async () => {
    vi.mocked(useOpportunity).mockReturnValue({ data: mockOpportunity, isLoading: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/opportunity name/i)).toHaveValue('Big Deal');
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when Opportunity Name is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /create opportunity/i }));

    expect(await screen.findByText(/opportunity name is required/i)).toBeInTheDocument();
  });

  it('shows validation error when Account is not selected', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/opportunity name/i), 'New Deal');
    await user.click(screen.getByRole('button', { name: /create opportunity/i }));

    expect(await screen.findByText(/account is required/i)).toBeInTheDocument();
  });

  it('calls createOpportunity mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/opportunity name/i), 'New Deal');
    await user.click(screen.getByRole('combobox', { name: /account/i }));
    await user.click(screen.getByRole('option', { name: 'Acme Corp' }));
    await user.click(screen.getByRole('button', { name: /create opportunity/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          opportunityName: 'New Deal',
          accountId: 'acc-1',
        }),
        expect.any(Object),
      );
    });
  });

  it('calls updateOpportunity mutation with payload in edit mode', async () => {
    vi.mocked(useOpportunity).mockReturnValue({ data: mockOpportunity, isLoading: false } as any);
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/opportunity name/i)).toHaveValue('Big Deal'));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'opp-1',
          payload: expect.objectContaining({ opportunityName: 'Big Deal' }),
        }),
        expect.any(Object),
      );
    });
  });

  it('shows loading spinner in edit mode while fetching', () => {
    vi.mocked(useOpportunity).mockReturnValue({ data: undefined, isLoading: true } as any);
    renderEdit();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });

  it('navigates back to /opportunities when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/opportunities');
  });
});
