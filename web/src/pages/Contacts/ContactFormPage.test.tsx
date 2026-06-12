import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useContact, useCreateContact, useUpdateContact } from '../../hooks/useContacts';
import { useCustomers } from '../../hooks/useCustomers';
import { ContactStatus } from '../../api/contacts';
import ContactFormPage from './ContactFormPage';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useContacts');
vi.mock('../../hooks/useCustomers');

const mockContact = {
  id: 'contact-1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  accountId: null,
  accountName: null,
  status: ContactStatus.Active,
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/contacts/new']}>
      <Routes>
        <Route path="/contacts/new" element={<ContactFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/contacts/contact-1/edit']}>
      <Routes>
        <Route path="/contacts/:id/edit" element={<ContactFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ContactFormPage', () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateMutate.mockClear();
    mockUpdateMutate.mockClear();
    vi.mocked(useContact).mockReturnValue({ data: undefined, isLoading: false, isError: false } as any);
    vi.mocked(useCreateContact).mockReturnValue({ mutate: mockCreateMutate, isPending: false } as any);
    vi.mocked(useUpdateContact).mockReturnValue({ mutate: mockUpdateMutate, isPending: false } as any);
    vi.mocked(useCustomers).mockReturnValue({ data: { items: [], total: 0, page: 1, pageSize: 100 } } as any);
  });

  it('renders empty form in create mode', () => {
    renderCreate();

    expect(screen.getByRole('button', { name: /create contact/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('pre-populates fields in edit mode when contact data loads', async () => {
    vi.mocked(useContact).mockReturnValue({ data: mockContact, isLoading: false, isError: false } as any);
    renderEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
    });
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows validation error when First Name is empty', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /create contact/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /create contact/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it('calls createContact mutation with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /create contact/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          email: 'jane@example.com',
        }),
        expect.any(Object),
      );
    });
  });

  it('calls updateContact mutation with payload in edit mode', async () => {
    vi.mocked(useContact).mockReturnValue({ data: mockContact, isLoading: false, isError: false } as any);
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane'));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'contact-1',
          payload: expect.objectContaining({
            firstName: 'Jane',
            email: 'jane@example.com',
          }),
        }),
        expect.any(Object),
      );
    });
  });

  it('navigates back to /contacts when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/contacts');
  });
});
