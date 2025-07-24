
// The base URL for the API (should NOT end with /api)
const API_URL = import.meta.env.VITE_API_URL || 'https://consumer-ai-render.onrender.com';
/**
 * Simple API client for ConsumerAI
 */

// Simple fetch wrapper with error handling, now requires userId for authenticated endpoints
async function fetchApi(endpoint: string, options: RequestInit = {}, userId?: string) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (userId) {
    headers.set('user-id', userId);
    console.log(`[API] Including user ID in headers: ${userId}`);
  } else {
    console.warn('[API] No user ID provided for request');
  }
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_URL}/api/${normalizedEndpoint}`;
  const finalUrl = API_URL.endsWith('/api')
    ? `${API_URL}/${normalizedEndpoint}`
    : url;
  console.log(`[API] Fetching ${finalUrl}`);
  console.log(`[API] Request body:`, options.body);
  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API] Error response:`, errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[API] Error fetching ${url}:`, error);
    throw error;
  }
}



// API client with simple methods
export const api = {
  // Buy a prompt and deduct credits
  buyPrompt: (promptId: string, userId: string) => {
    if (!userId) throw new Error('User ID is required for buying a prompt');
    if (!promptId) throw new Error('Prompt ID is required');
    return fetchApi('prompts/buy', {
      method: 'POST',
      body: JSON.stringify({ promptId })
    }, userId);
  },
  // Use a template and deduct credits
  useTemplate: (templateId: string, userId: string) => {
    if (!userId) throw new Error('User ID is required for using a template');
    if (!templateId) throw new Error('Template ID is required');
    return fetchApi('templates/use', {
      method: 'POST',
      body: JSON.stringify({ templateId })
    }, userId);
  },
  // Chat
  sendMessage: (message: string, sessionId: string, userId: string) => {
    if (!userId) {
      throw new Error('User ID is required for sending messages');
    }
    if (!message || !sessionId) {
      throw new Error('Message and sessionId are required');
    }
    // Always include userId in the body for backend validation
    return fetchApi('chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, userId })
    }, userId);
  },

  // Chat history
  getChatHistory: (userId: string) => {
    if (!userId) throw new Error('User ID is required for chat history');
    return fetchApi('chat/history', {}, userId);
  },

  // Session
  createSession: (data: { userId: string, sessionName?: string }, userId: string) => {
    if (!userId) throw new Error('User ID is required for session creation');
    // Always include userId in both header and body
    return fetchApi('session', {
      method: 'POST',
      body: JSON.stringify({ ...data, userId })
    }, userId);
  },

  getSession: (userId: string) => {
    if (!userId) throw new Error('User ID is required for getSession');
    return fetchApi('session', {}, userId);
  },

  // User limits
  getChatLimits: (userId: string) => {
    if (!userId) throw new Error('User ID is required for getChatLimits');
    return fetchApi('users/limits', {}, userId);
  },

  // Storage quota
  getStorageQuota: (userId: string) => {
    if (!userId) throw new Error('User ID is required for getStorageQuota');
    return fetchApi('storage/quota', {}, userId);
  },

  // Storage upgrade
  upgradeStorage: (plan: string, userId: string) => {
    if (!userId) throw new Error('User ID is required for upgradeStorage');
    return fetchApi('storage/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan })
    }, userId);
  },

  // Payment verification
  verifyPayment: (sessionId: string, userId: string) => {
    if (!userId) throw new Error('User ID is required for payment verification');
    if (!sessionId) throw new Error('Session ID is required for payment verification');
    return fetchApi('payments/verify', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    }, userId);
  },

  // Tavus: Create a new conversation (calls backend API route)
  createTavusConversation: (payload: {
    replica_id: string;
    persona_id: string;
    conversation_name: string;
    conversational_context: string;
    properties?: Record<string, any>;
  }) => {
    // No userId required for Tavus conversation
    return fetchApi('conversations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};