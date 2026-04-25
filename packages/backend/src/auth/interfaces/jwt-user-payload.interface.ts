export interface JwtUserPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
