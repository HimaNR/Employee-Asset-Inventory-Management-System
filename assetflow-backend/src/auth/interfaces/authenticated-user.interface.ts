/** What the JWT guard puts on request.user */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  employeeId: string | null;
}

/** Claims inside the access token */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  employeeId: string | null;
}

/** Claims inside the refresh token (kept minimal) */
export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}
