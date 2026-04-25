import { StoredAuthSession } from './types/auth-session';

const AUTH_SESSION_KEY = 'project-crm.auth.session';

export function loadStoredAuthSession(): StoredAuthSession | null {
  const rawValue = localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredAuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function saveStoredAuthSession(session: StoredAuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}
