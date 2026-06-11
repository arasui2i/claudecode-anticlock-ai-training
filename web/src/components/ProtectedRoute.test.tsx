import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../context/AuthContext');

const mockAuthBase = {
  user: null,
  roles: [],
  token: null,
  setAuth: vi.fn(),
  logout: vi.fn(),
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockClear();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthBase,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthBase,
      user: { id: 'u1', email: 'a@a.com', username: 'alice', roles: ['Admin'] },
      token: 'jwt-token',
      roles: ['Admin'],
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders nothing while auth state is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthBase,
      isAuthenticated: false,
      isLoading: true,
    });

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
