/* REST client for identity-access-service — proxied through /iam. */

import axios from 'axios';

const iam = axios.create({
  baseURL: '/iam',
  headers: { 'Content-Type': 'application/json' },
});

export interface IAMLoginRequest {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface IAMUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface IAMTenant {
  id: string;
  name: string;
  slug: string;
}

export interface IAMLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_in: number;
  user: IAMUser;
  tenant: IAMTenant;
}

export interface IAMRefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_in: number;
}

/**
 * Login via IAM service. Falls back to mock login if IAM is unreachable.
 */
export async function iamLogin(request: IAMLoginRequest): Promise<IAMLoginResponse> {
  const { data } = await iam.post<IAMLoginResponse>('/api/v1/auth/login', request);
  return data;
}

/**
 * Refresh the access token using a refresh token.
 */
export async function iamRefresh(refreshToken: string): Promise<IAMRefreshResponse> {
  const { data } = await iam.post<IAMRefreshResponse>('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  });
  return data;
}

/**
 * Logout — revoke the refresh token.
 */
export async function iamLogout(refreshToken: string): Promise<void> {
  await iam.post('/api/v1/auth/logout', { refresh_token: refreshToken });
}
