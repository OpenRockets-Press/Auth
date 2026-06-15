import type {  App, Scope  } from '../models/types';

/**
 * Auth API Integration Service Layer
 * 
 * Handles interaction with Laravel Passport authorization endpoints.
 */

const API_BASE_URL = 'http://api.datahub.local/oauth';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'omit', // Switch to include if session cookie is used for the consent screen
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

export const AuthApi = {
  // Retrieves the client info and requested scopes to display on the consent screen
  getAuthorizationDetails: (authRequestId: string) => 
    fetchWithAuth<{ client: App; scopes: Scope[] }>(`/authorize/details?request_id=${authRequestId}`),

  // Approves or Denies the authorization request
  submitConsent: (authRequestId: string, action: 'approve' | 'deny') => 
    fetchWithAuth<{ redirect_uri: string }>(`/authorize`, {
      method: 'POST',
      body: JSON.stringify({ request_id: authRequestId, action })
    })
};
