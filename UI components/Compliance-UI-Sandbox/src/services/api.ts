import type {  User, ConsentRequest  } from '../models/types';

/**
 * Compliance API Integration Service Layer
 * 
 * Maps frontend React interactions to the decoupled Laravel backend endpoints.
 * Handles GDPR Data Exports, Account Deletion, and COPPA Parental Consents.
 */

const API_BASE_URL = 'http://api.datahub.local/api/compliance';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'omit', // Switch to 'include' if using Sanctum
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const ComplianceApi = {
  // GDPR Rights
  requestDataExport: () => fetchWithAuth<{ job_id: string; status: string }>('/data/export', { method: 'POST' }),
  deleteAccount: () => fetchWithAuth<{ success: boolean }>('/data/delete', { method: 'POST' }),

  // COPPA Parental Consent
  verifyConsentToken: (token: string) => fetchWithAuth<{ request: ConsentRequest; child: User }>(`/consent/verify/${token}`),
  resolveConsent: (token: string, action: 'grant' | 'deny') => fetchWithAuth<{ success: boolean }>(`/consent/verify/${token}`, {
    method: 'POST',
    body: JSON.stringify({ action })
  }),
};
