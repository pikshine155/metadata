export interface UserProfile {
  id: string;
  email: string;
  credits_used: number;
  credits_limit: number;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
  expiration_date?: string;
}

export interface ImageMetadataGeneration {
  id: string;
  user_id: string;
  prompt: string;
  created_at?: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  email: string;
  session_id: string;
  last_activity: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  last_seen: string;
  created_at: string;
  session_id: string;
  country?: string;
  city?: string;
}
