import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { HttpError } from '../../shared/api/http';
import { User } from '../../shared/types/user';
import {
  fetchCurrentUserRequest,
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from './auth-api';
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  saveStoredAuthSession,
} from './auth-storage';
import { StoredAuthSession } from './types/auth-session';

interface AuthContextValue {
  access_token: string | null;
  refresh_token: string | null;
  user: User | null;
  is_authenticated: boolean;
  is_bootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toStoredSession(session: StoredAuthSession): StoredAuthSession {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: session.user,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  function persistSession(session: StoredAuthSession) {
    const nextSession = toStoredSession(session);

    setAccessToken(nextSession.access_token);
    setRefreshToken(nextSession.refresh_token);
    setUser(nextSession.user);
    saveStoredAuthSession(nextSession);
  }

  function clearSession() {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    clearStoredAuthSession();
  }

  async function restoreSession() {
    const storedSession = loadStoredAuthSession();

    if (!storedSession) {
      clearSession();
      return;
    }

    try {
      const currentUser = await fetchCurrentUserRequest(storedSession.access_token);

      persistSession({
        ...storedSession,
        user: currentUser,
      });
      return;
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 401) {
        clearSession();
        return;
      }
    }

    try {
      const refreshedSession = await refreshSessionRequest(storedSession.refresh_token);
      persistSession(refreshedSession);
    } catch {
      clearSession();
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        await restoreSession();
      } finally {
        if (!isCancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function login(payload: LoginPayload) {
    const session = await loginRequest(payload);
    persistSession(session);
  }

  async function register(payload: RegisterPayload) {
    const session = await registerRequest(payload);
    persistSession(session);
  }

  async function logout() {
    if (accessToken) {
      try {
        await logoutRequest(accessToken);
      } catch {
        // Local session must still be cleared even if backend logout failed.
      }
    }

    clearSession();
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
      is_authenticated: Boolean(accessToken && user),
      is_bootstrapping: isBootstrapping,
      login,
      register,
      logout,
    }),
    [accessToken, isBootstrapping, refreshToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
