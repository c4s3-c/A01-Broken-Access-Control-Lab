export interface JwtPayload {
  sub: string;
  email: string;
  tenant_id: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  iat?: number;
  exp?: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  tokens: Tokens;
}
