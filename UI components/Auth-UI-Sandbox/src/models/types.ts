export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending_parental_consent';
  created_at: string;
  updated_at: string;
}

export interface App {
  id: number;
  client_id: string;
  name: string;
  description: string | null;
  status: 'verified' | 'unverified' | 'suspended';
  owner?: User;
}

export interface Scope {
  id: string;
  description: string;
}
