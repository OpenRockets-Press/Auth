export interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending_parental_consent';
  country?: string;
  age?: number;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentRequest {
  id: string;
  child_id: number;
  parent_email: string;
  status: 'pending' | 'granted' | 'denied';
  token: string;
  created_at: string;
}
