import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/api";
import { AgentEvent } from "@/lib/agentCallbacks";
import { API_BASE_URL } from "@/lib/config";

// Progress type for agent/step UI
export interface ChatProgress {
  steps: string[];
  current: number;
}

// Agent state for tracking agent actions
export interface AgentState {
  isActive: boolean;
  events: AgentEvent[];
}

/**
 * Centralized chat state management for a single active chat session.
 * Handles loading chat history and sending messages.
 */
export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "0-ai",
    content: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
    role: "assistant",
    created_at: new Date().toISOString()
  }]);
  
  // Debug: log user state
  useEffect(() => {
    console.log('[useChat] Current user:', user);
  }, [user]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use Supabase user ID as sessionId for chat history
  const [currentChatId, setCurrentChatId] = useState<string | null>(user?.id ?? null);
  const [progress, setProgress] = useState<ChatProgress | null>(null);
  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false,
    events: []
  });
  const [useStreaming, setUseStreaming] = useState<boolean>(false);

  // Debug: log state changes
  useEffect(() => {
    console.log('[useChat] messages updated:', messages);
  }, [messages]);
  useEffect(() => {
    if (error) console.error('[useChat] error:', error);
  }, [error]);
  useEffect(() => {
    console.log('[useChat] isLoading:', isLoading);
  }, [isLoading]);

  // Load chat history for a given chatId (single source of truth)
  const loadChatById = useCallback(async (chatId: string) => {
    if (!chatId) return;
    setIsLoading(true);
    setError(null);
    
    // Show progress animation
    setProgress({
      steps: ['Loading Chat', 'Processing History', 'Preparing Interface'],
      current: 0
    });
    
    console.log('[useChat] loadChatById called:', { chatId, userId: user?.id });
    try {
      setCurrentChatId(chatId);
      
      // Update progress
      setProgress(prev => prev ? { ...prev, current: 1 } : null);
      
      // Fetch chat history for this chatId (API expects userId)
      if (!user?.id) throw new Error('User ID is required to load chat history');
      if (!currentChatId) throw new Error('Session ID is required for chat history');
      const response = await api.getChatHistory(currentChatId, user.id);
      console.log('[useChat] getChatHistory response:', response);
      
      // Update progress
      setProgress(prev => prev ? { ...prev, current: 2 } : null);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Transform backend messages to expected frontend format
        const transformed: ChatMessage[] = [];
        response.data.forEach((entry: any) => {
          // Always map 'text' or 'message' to 'content'
          if (entry.message || entry.text) {
            const content = entry.message || entry.text;
            transformed.push({
              id: entry.id || entry._id || `${entry.created_at}-user`,
              content,
              role: "user",
              created_at: entry.created_at,
            });
          }
          if (entry.response) {
            transformed.push({
              id: entry.id ? entry.id + "-ai" : `${entry.created_at}-ai`,
              content: entry.response,
              role: "assistant",
              created_at: entry.created_at,
            });
          }
        });
        console.log('[useChat] transformed chat history (content-mapped):', transformed);
        setMessages(transformed);
      } else {
        setMessages([{
          id: "0-ai",
          content: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
          role: "assistant",
          created_at: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('[useChat] Failed to load chat history:', err);
      setError('Failed to load chat history');
      setMessages([{
        id: "0-ai",
        content: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
        role: "assistant",
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      setProgress(null); // Clear progress when done
    }
  }, [user?.id]);

  // On mount, load default chat if user is logged in and no chatId is set
  useEffect(() => {
    // Always set currentChatId to user.id when user changes
    if (user?.id) {
      setCurrentChatId(user.id);
      setIsLoading(true);
      setProgress({
        steps: ['Connecting', 'Loading History', 'Preparing Chat'],
        current: 0
      });
      // Load chat history using user.id as sessionId
      api.getChatHistory(user.id, user.id)
        .then(historyResponse => {
          setProgress(prev => prev ? { ...prev, current: 2 } : null);
          if (historyResponse.data && Array.isArray(historyResponse.data) && historyResponse.data.length > 0) {
            const transformed: ChatMessage[] = [];
            historyResponse.data.forEach((entry: any) => {
              if (entry.message) {
                transformed.push({
                  id: entry.id || entry._id || `${entry.created_at}-user`,
                  content: entry.message,
                  role: "user",
                  created_at: entry.created_at,
                });
              }
              if (entry.response) {
                transformed.push({
                  id: entry.id ? entry.id + "-ai" : `${entry.created_at}-ai`,
                  content: entry.response,
                  role: "assistant",
                  created_at: entry.created_at,
                });
              }
            });
            const mapped = transformed.map(msg => ({
              ...msg,
              content: msg.content || (msg as any).text || (msg as any).message || '',
            }));
            console.log('[useChat] loaded chat history (content-mapped):', mapped);
            setMessages(mapped);
          }
        })
        .catch(() => {
          setMessages([{
            id: "0-ai",
            content: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
            role: "assistant",
            created_at: new Date().toISOString()
          }]);
        })
        .finally(() => {
          setIsLoading(false);
          setProgress(null); // Clear progress when done
        });
    } else {
      setCurrentChatId(null);
    }
  }, [user?.id]);

  // Send a message in the current chat (single source of truth)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    if (!user?.id) {
      console.error('[useChat] No user ID available for sending message');
      setError('Please log in to send messages');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAgentState({
      isActive: true,
      events: []
    });
    setProgress({
      steps: ['Processing', 'Analyzing', 'Generating Response'],
      current: 0
    });
    try {
      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        content: content,
        role: "user",
        created_at: new Date().toISOString(),
      };
      setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
      setProgress(prev => prev ? { ...prev, current: 2, steps: prev.steps } : null);
      // Simulate agent actions with timeouts (unchanged)
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 1 } : null);
        setAgentState(prev => ({
          ...prev,
          events: [...prev.events, {
            type: 'tool_start',
            name: 'knowledge_base',
            content: 'Searching for information about consumer rights... (AI Agent Action)',
            timestamp: Date.now()
          }]
        }));
      }, 800);
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 2 } : null);
        setAgentState(prev => ({
          ...prev,
          events: [...prev.events, {
            type: 'tool_end',
            name: 'knowledge_base',
            content: 'Found relevant information about consumer protection laws (AI Agent Action)',
            timestamp: Date.now()
          }]
        }));
      }, 2000);
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 3 } : null);
        setAgentState(prev => ({
          ...prev,
          events: [...prev.events, {
            type: 'thinking',
            content: 'Formulating response based on consumer rights information... (AI Agent Action)',
            timestamp: Date.now()
          },
          {
            type: 'tool_start',
            name: 'mail_tracking',
            content: 'To track your certified mail, please use the Mail Tracking tool below. This is an integration, not an AI agent.',
            timestamp: Date.now()
          }
          ]
        }));
      }, 3000);
      // Use regular API, always use user.id for both sessionId and userId
      let response;
      try {
        response = await api.sendMessage(content, user.id, user.id);
        console.log('[useChat] sendMessage response:', response);
      } catch (error) {
        console.error('[useChat] sendMessage error:', error);
        throw error;
      }
      if (response && response.data) {
        setMessages((prev: ChatMessage[]) => response.data ? [...prev, response.data] : prev);
      } else if (response && response.error) {
        setError(response.error.message);
      } else {
        setError('Received invalid response from server');
      }
      setAgentState(prev => ({ ...prev, isActive: false }));
    } catch (err) {
      setError('Failed to send message');
      setAgentState(prev => ({ ...prev, isActive: false }));
    } finally {
      setIsLoading(false);
      setProgress(null); // Clear progress when done
    }
  }, [user?.id]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadChatById,
    progress,
    setProgress,
    agentState,
    useStreaming,
    setUseStreaming,
  };
}