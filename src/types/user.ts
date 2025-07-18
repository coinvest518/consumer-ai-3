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
  created_at: string;
  updated_at: string;
  questions_asked: number;
  questions_remaining: number;
  is_pro: boolean;
}
