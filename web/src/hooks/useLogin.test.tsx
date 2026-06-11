import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useLogin } from './useLogin';
import { loginApi, tokenStorage } from '../api/auth';

// Hoisted so factories below can reference them before module-level code runs
const mockNavigate = vi.hoisted(() => vi.fn());
const mockSetAuth = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ setAuth: mockSetAuth }),
}));

vi.mock('../api/auth', () => ({
  loginApi: vi.fn(),
  tokenStorage: {
    store: vi.fn(),
    getToken: vi.fn(),
    getUser: vi.fn(),
    clear: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockLoginResponse = {
  accessToken: 'test-jwt-token',
  expiresAt: '2026-12-31T00:00:00Z',
  user: { id: 'user-1', email: 'test@example.com', username: 'testuser', roles: ['Admin'] },
};

describe('useLogin', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetAuth.mockClear();
    vi.mocked(loginApi).mockClear();
    vi.mocked(tokenStorage.store).mockClear();
  });

  it('stores token, calls setAuth, and navigates on success', async () => {
    vi.mocked(loginApi).mockResolvedValueOnce(mockLoginResponse);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({
      emailOrUsername: 'test@example.com',
      password: 'secret123',
      rememberMe: false,
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/customers'));

    expect(tokenStorage.store).toHaveBeenCalledWith(mockLoginResponse, false);
    expect(mockSetAuth).toHaveBeenCalledWith(
      mockLoginResponse.user,
      mockLoginResponse.accessToken,
    );
  });

  it('sets apiError to "Invalid email or password." on 401', async () => {
    const error401 = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    });
    vi.mocked(loginApi).mockRejectedValueOnce(error401);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({
      emailOrUsername: 'test@example.com',
      password: 'wrongpassword',
      rememberMe: false,
    });

    await waitFor(() =>
      expect(result.current.apiError).toBe('Invalid email or password.'),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sets generic apiError for non-401 failures', async () => {
    vi.mocked(loginApi).mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({
      emailOrUsername: 'test@example.com',
      password: 'secret123',
      rememberMe: false,
    });

    await waitFor(() =>
      expect(result.current.apiError).toBe(
        'An unexpected error occurred. Please try again.',
      ),
    );
  });
});
