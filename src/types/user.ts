export interface User {
  id: string;
  email: string;
  isPro: boolean;
  created_at: string;
}

export interface UserMetrics {
  chatsUsed: number;
  dailyLimit: number;
  remaining: number;
  isPro: boolean;
  lastUpdated: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMetricsData {
  id: string;
  user_id: string;
  chats_used: number;
  daily_limit: number;
  last_reset?: string;
  created_at: string;
  updated_at: string;
}
