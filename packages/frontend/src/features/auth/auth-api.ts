import { httpRequest } from '../../shared/api/http';
import { User } from '../../shared/types/user';
import { AuthTokensResponse } from './types/auth-session';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export function loginRequest(payload: LoginPayload) {
  return httpRequest<AuthTokensResponse>({
    path: '/auth/login',
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return httpRequest<AuthTokensResponse>({
    path: '/auth/register',
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refreshSessionRequest(refreshToken: string) {
  return httpRequest<AuthTokensResponse>({
    path: '/auth/refresh',
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });
}

export function fetchCurrentUserRequest(accessToken: string) {
  return httpRequest<User>({
    path: '/auth/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function logoutRequest(accessToken: string) {
  return httpRequest<{ success: boolean }>({
    path: '/auth/logout',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
