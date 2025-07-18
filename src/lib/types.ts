export interface PaymentVerificationResponse {
  paid: boolean;
  customerEmail?: string;
  sessionId: string;
  processed: boolean;
}

export interface ChatMetricsResponse {
  chatsUsed: number;
  dailyLimit: number;
  remaining: number;
  isPro: boolean;
  lastUpdated: string;
}

// Add any other shared types that are needed across the app
export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  type: 'chat' | 'system' | 'purchase' | 'email' | 'user' | 'ai';
  timestamp: number;
  citation?: string;
  actions?: string[];
  metadata?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
