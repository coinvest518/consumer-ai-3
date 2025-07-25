export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  timestamp?: number;
  decisionTrace?: {
    usedAgent: string | null;
    steps: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
  messages?: ChatMessage[];
}

export interface ChatSessionCreateParams {
  userId: string;
  email?: string;
  sessionName?: string;
}

export interface ChatSessionData {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  lastMessageAt?: string;
}

export interface PaymentVerificationResponse {
  paid: boolean;
  customerEmail?: string;
  sessionId: string;
  processed: boolean;
}
