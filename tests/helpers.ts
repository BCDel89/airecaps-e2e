import * as fs from 'fs';
import * as path from 'path';

export const API_URL = process.env.API_URL || 'https://api-staging.airecaps.com';
export const FE_URL = process.env.FE_URL || 'https://staging.airecaps.com';

export interface AuthState {
  email: string;
  password: string;
  token: string;
  userId: number;
}

export function readState(): AuthState {
  const p = path.join(__dirname, '..', '.auth', 'state.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}
