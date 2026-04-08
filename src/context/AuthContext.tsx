import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getMe, login as apiLogin, register as apiRegister } from '../api/services';
import { getStoredToken, setStoredToken } from '../api/client';
import type { AuthUser } from '../api/types';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = await getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      await setStoredToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshUser();
      if (!cancelled) {
        setLoading(false);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await setStoredToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const res = await apiRegister(email, password, fullName);
      await setStoredToken(res.token);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      ready,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, ready, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
