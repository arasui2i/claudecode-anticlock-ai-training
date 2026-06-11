import { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage, type AuthUser } from '../api/auth';

interface AuthState {
  user: AuthUser | null;
  roles: string[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = tokenStorage.getToken();
    const storedUser  = tokenStorage.getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const setAuth = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, roles: user?.roles ?? [], token, isAuthenticated: !!token, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
