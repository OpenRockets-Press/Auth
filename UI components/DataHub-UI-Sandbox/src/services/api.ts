import type {  User, App, DataSharingAgreement, TrustedDevice, UserDataStore, DeveloperStats  } from '../models/types';

/**
 * DataHub Integration Service Layer
 * 
 * This file serves as the comprehensive guide on how the React frontend
 * connects to the decoupled Laravel backend. 
 * 
 * Because the DataHub frontend operates completely independently from the backend (SPA approach),
 * all data mutations and queries must traverse this API layer using standard REST verbs,
 * authenticated via an HTTP-Only session cookie or an injected Bearer token.
 */

const API_BASE_URL = 'http://api.datahub.local/api';

/**
 * Core Fetch Wrapper
 * Handles injecting authentication headers, checking for 401s (Unauthorized),
 * and standardizing error handling across all portals.
 */
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Note: In a real production build using Laravel Sanctum SPA auth, 
  // credentials: 'include' ensures the HTTP-Only cookie is sent with every request.
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'omit', // Switch to 'include' if using Sanctum stateful domains
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Use if using Passport tokens
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized (e.g., trigger logout or redirect to login)
      console.error('Unauthorized access. Redirecting to login...');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// 1. User Account & Profile Integration
// ==========================================
export const AccountApi = {
  /** Fetch the currently authenticated user's profile */
  getProfile: () => fetchWithAuth<User>('/user/profile'),
  
  /** Update user profile data */
  updateProfile: (data: Partial<User>) => fetchWithAuth<User>('/user/profile', { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  
  /** Get all devices currently logged into this account */
  getTrustedDevices: () => fetchWithAuth<TrustedDevice[]>('/settings/devices'),
  
  /** Forcibly log out a specific device */
  revokeDevice: (deviceId: number) => fetchWithAuth<{ success: boolean }>(`/settings/devices/${deviceId}`, { 
    method: 'DELETE' 
  }),
};

// ==========================================
// 2. DataHub (Cross-App Data & Consent)
// ==========================================
export const DataHubApi = {
  /** Get all OAuth apps the user has granted access to */
  getConnectedApps: () => fetchWithAuth<App[]>('/data-hub/apps'),
  
  /** Get all key-value data a specific app has stored about this user in the Data Hub */
  getAppData: (appId: number) => fetchWithAuth<UserDataStore[]>(`/data-hub/apps/${appId}/data`),
  
  /** Delete a specific piece of data stored by an app */
  deleteAppData: (key: string) => fetchWithAuth<{ success: boolean }>(`/data-hub/data/${key}`, { 
    method: 'DELETE' 
  }),
  
  /** Get active RFC 8693 data sharing agreements between apps */
  getAgreements: () => fetchWithAuth<DataSharingAgreement[]>('/data-hub/agreements'),
  
  /** Revoke an app's permission to share data with another app */
  revokeAgreement: (agreementId: number) => fetchWithAuth<{ success: boolean }>(`/data-hub/agreements/${agreementId}`, { 
    method: 'DELETE' 
  }),
};

// ==========================================
// 3. Developer Portal Integration
// ==========================================
export const DeveloperApi = {
  /** Get aggregated telemetry (total apps, requests, consents) */
  getStats: () => fetchWithAuth<DeveloperStats>('/developer/stats'),
  
  /** List all OAuth clients owned by the current developer */
  getApps: () => fetchWithAuth<App[]>('/developer/apps'),
  
  /** Get specific OAuth client details */
  getAppDetails: (appId: number) => fetchWithAuth<App>(`/developer/apps/${appId}`),
  
  /** 
   * Register a new OAuth client.
   * Returns the App details along with the ONE-TIME client_secret.
   */
  createApp: (data: { name: string; description: string; redirect_uris: string[] }) => 
    fetchWithAuth<{ app: App; client_secret: string }>('/developer/apps', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
  /** Regenerate the client secret (invalidates the old one) */
  regenerateSecret: (appId: number) => fetchWithAuth<{ client_secret: string }>(`/developer/apps/${appId}/secret/regenerate`, {
    method: 'POST'
  }),
};

// ==========================================
// 4. Admin Console Integration
// ==========================================
export const AdminApi = {
  /** List all users in the system (paginated in a real app) */
  getUsers: () => fetchWithAuth<User[]>('/admin/users'),
  
  /** Suspend a user account */
  suspendUser: (userId: number) => fetchWithAuth<User>(`/admin/users/${userId}/suspend`, { 
    method: 'POST' 
  }),
  
  /** List all OAuth clients registered on the platform */
  getApps: () => fetchWithAuth<App[]>('/admin/apps'),
  
  /** Mark an OAuth client as 'verified', removing consent screen warnings */
  verifyApp: (appId: number) => fetchWithAuth<App>(`/admin/apps/${appId}/verify`, { 
    method: 'POST' 
  }),
};
