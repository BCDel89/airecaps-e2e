import * as fs from 'fs';
import * as path from 'path';

export const API_URL = process.env.API_URL || 'http://api-recaps-staging.100-85-168-42.sslip.io';
export const TRANSCRIPT_URL = process.env.TRANSCRIPT_URL || 'http://transcript-staging.100-85-168-42.sslip.io';
export const FE_URL = process.env.FE_URL || 'http://ai-recaps-staging.100-85-168-42.sslip.io';

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
