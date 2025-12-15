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

// Types for Credit Report Analysis
export interface AnalysisEvidence {
  quote: string;
  sourcePage?: number;
}

export interface AnalysisFinding {
  id: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  accountName: string;
  accountNumber: string;
  evidence: AnalysisEvidence[];
  violates?: string[]; // e.g., ['FCRA § 605']
}

export interface AnalysisActionableItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisReport {
  version: string; // e.g., '1.0'
  documentId: string;
  documentName: string;
  analysisDate: string; // ISO 8601 date string
  summary: {
    totalViolations: number;
    totalErrors: number;
    totalActionableItems: number;
  };
  violations: AnalysisFinding[];
  errors: AnalysisFinding[];
  actionableItems: AnalysisActionableItem[];
}

// Wrapper for messages that might contain an analysis report
export interface AnalysisMessage {
  analysisReport: AnalysisReport;
}
