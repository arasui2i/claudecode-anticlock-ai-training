import apiClient from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

// ── Token storage ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'token';
const USER_KEY  = 'crm_user';

export const tokenStorage = {
  store(response: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, response.accessToken);
    storage.setItem(USER_KEY, JSON.stringify(response.user));
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  clear(): void {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
  },
};

// ── API call ──────────────────────────────────────────────────────────────────

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', payload);
  return data;
}
