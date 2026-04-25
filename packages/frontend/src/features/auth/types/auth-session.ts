import { User } from '../../../shared/types/user';

export interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface StoredAuthSession extends AuthTokensResponse {}
