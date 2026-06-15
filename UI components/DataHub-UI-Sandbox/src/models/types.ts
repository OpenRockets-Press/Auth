export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  last_login_at: string | null;
  login_method: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  user_id: number;
  date_of_birth: string | null;
  country_code: string | null;
  state: string | null;
  city: string | null;
  age_verified: boolean;
  age_verification_method: string | null;
  parental_consent_required: boolean;
  parental_consent_status: 'pending' | 'granted' | 'denied' | null;
  onboarding_status: 'pending' | 'completed';
  onboarding_completed_at: string | null;
}

export interface App {
  id: number;
  owner_id: number;
  client_id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  status: 'development' | 'review' | 'verified' | 'rejected' | 'suspended';
  is_system: boolean;
  redirect_uris: string[];
  homepage_url: string | null;
  privacy_policy_url: string | null;
  terms_url: string | null;
  category: string | null;
  verified_at: string | null;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
  owner?: User;
}

export interface ActivityLog {
  id: number;
  action: string;
  date: string;
  app: string;
}

export interface DeveloperStats {
  total_apps: number;
  total_consents: number;
  total_api_requests: number;
  active_webhooks: number;
  recent_activity: ActivityLog[];
}

export interface DataSharingAgreement {
  id: number;
  source_app_id: number;
  target_app_id: number;
  scopes: string[];
  status: 'active' | 'revoked';
  created_at: string;
  source_app?: App;
  target_app?: App;
}

export interface UserDataStore {
  id: number;
  user_id: number;
  app_id: number;
  key: string;
  value: string;
  updated_at: string;
}

export interface TrustedDevice {
  id: number;
  name: string;
  browser: string;
  ip_address: string;
  is_current: boolean;
  last_active: string;
}
