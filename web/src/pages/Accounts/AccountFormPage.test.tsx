import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAccount, useCreateAccount, useUpdateAccount } from '../../hooks/useAccounts';
import { AccountStatus } from '../../api/accounts';
import AccountFormPage from './AccountFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useAccounts');

const mockAccount = {
  id: 'account-1',
  accountName: 'Acme Corp',
  industry: 'Technology',
  website: 'https://acme.example.com',
  phone: '+1-555-0100',
  status: AccountStatus.Active,
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/accounts/new']}>
      <Routes>
        <Route path="/accounts/new" element={<AccountFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/accounts/account-1/edit']}>
      <Routes>
        <Route path="/accounts/:id/edit" element={<AccountFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AccountFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useAccount).mockReturnValue({ data: undefined, isLoading: false } as any);
    vi.mocked(useCreateAccount).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateAccount).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/account name/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when account data loads', async () => {
    vi.mocked(useAccount).mockReturnValue({ data: mockAccount, isLoading: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/account name/i)).toHaveValue('Acme Corp');
    });
    expect(screen.getByLabelText(/industry/i)).toHaveValue('Technology');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when Account Name is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/account name is required/i)).toBeInTheDocument();
  });

  it('calls createAccount mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/account name/i), 'New Corp');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ accountName: 'New Corp' }),
        expect.any(Object),
      );
    });
  });

  it('calls updateAccount mutation with payload in edit mode', async () => {
    vi.mocked(useAccount).mockReturnValue({ data: mockAccount, isLoading: false } as any);
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/account name/i)).toHaveValue('Acme Corp'));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'account-1',
          payload: expect.objectContaining({ accountName: 'Acme Corp' }),
        }),
        expect.any(Object),
      );
    });
  });

  it('shows loading spinner in edit mode while fetching', () => {
    vi.mocked(useAccount).mockReturnValue({ data: undefined, isLoading: true } as any);
    renderEdit();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });

  it('navigates back to /accounts when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/accounts');
  });
});
