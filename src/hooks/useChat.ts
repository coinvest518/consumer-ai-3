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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
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
      const response = await api.getChatHistory(user.id);
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
    if (!currentChatId && user?.id) {
      setIsLoading(true);
      // Show progress animation during initial loading
      setProgress({
        steps: ['Connecting', 'Loading History', 'Preparing Chat'],
        current: 0
      });
      
      // Small delay to show the animation
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 1 } : null);
        
        if (!user?.id) throw new Error('User ID is required to load chat history');
        api.getChatHistory(user.id)
          .then(historyResponse => {
            // Update progress
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
              // Always map 'text' or 'message' to 'content' for loaded chat history
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
      }, 300); // Small delay for animation
    }
  }, [user?.id, currentChatId]);

  // Send a message in the current chat (single source of truth)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Check for user ID
    if (!user?.id) {
      console.error('[useChat] No user ID available for sending message');
      setError('Please log in to send messages');
      return;
    }
    
    console.log('[useChat] Sending message with user ID:', user.id);
    setIsLoading(true);
    setError(null);
    
    // Reset agent state
    setAgentState({
      isActive: true,
      events: []
    });
    
    // Show thinking animation immediately
    setProgress({
      steps: ['Processing', 'Analyzing', 'Generating Response'],
      current: 0
    });
    
    try {
      let sessionId = currentChatId;
      // If no session, create one first or use the user's ID directly
      if (!sessionId) {
        try {
          console.log('[useChat] Creating new session for user:', user.id);
          // We can either create a session or just use the user's ID directly
          // Let's try to create a session first
          try {
            console.log('[useChat] Creating session with userId:', user.id);
            const sessionResponse = await api.createSession({ userId: user.id, sessionName: 'New Chat' }, user.id);
            console.log('[useChat] Session creation response:', sessionResponse);
            
            // Check if we got a valid session response
            if (sessionResponse && sessionResponse.data && sessionResponse.data.id) {
              // Response with data wrapper
              sessionId = sessionResponse.data.id;
              setCurrentChatId(sessionId);
              console.log('[useChat] Created session with ID (data wrapper):', sessionId);
            } else if (sessionResponse && sessionResponse.id) {
              // Direct response without data wrapper
              sessionId = sessionResponse.id;
              setCurrentChatId(sessionId);
              console.log('[useChat] Created session with ID (direct):', sessionId);
            } else {
              // Fallback to using the user's ID as the session ID
              sessionId = user.id;
              setCurrentChatId(sessionId);
              console.log('[useChat] Using user ID as session ID:', sessionId);
            }
          } catch (createError) {
            // If session creation fails, use the user's ID as the session ID
            console.warn('[useChat] Session creation failed, using user ID as session ID:', createError);
            sessionId = user.id;
            setCurrentChatId(sessionId);
          }
          
          if (!sessionId) {
            throw new Error("Failed to create a new chat session.");
          }
        } catch (sessionError) {
          console.error('[useChat] Session handling error:', sessionError);
          let errorMsg = "Unknown error";
          if (sessionError instanceof Error) {
            errorMsg = sessionError.message;
          } else if (typeof sessionError === "string") {
            errorMsg = sessionError;
          }
          throw new Error(`Failed to handle chat session: ${errorMsg}`);
        }
      }
      
      // Update progress animation
      setProgress(prev => prev ? { ...prev, current: 1, steps: prev.steps } : null);
      
      const userMessage: ChatMessage = {
        id: `${Date.now()}-user`,
        content: content,
        role: "user",
        created_at: new Date().toISOString(),
      };
      setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
      
      // Update progress animation
      setProgress(prev => prev ? { ...prev, current: 2, steps: prev.steps } : null);
      
      // Simulate agent actions with timeouts
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 1 } : null);
        
        // Add a simulated database search event
        setAgentState(prev => ({
          ...prev,
          events: [...prev.events, {
            type: 'tool_start',
            name: 'knowledge_base',
            content: 'Searching for information about consumer rights...',
            timestamp: Date.now()
          }]
        }));
      }, 800);
      
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 2 } : null);
        
        // Add a simulated analysis event
        setAgentState(prev => ({
          ...prev,
          events: [...prev.events, {
            type: 'tool_end',
            name: 'knowledge_base',
            content: 'Found relevant information about consumer protection laws',
            timestamp: Date.now()
          }]
        }));
      }, 2000);
      
      setTimeout(() => {
        setProgress(prev => prev ? { ...prev, current: 3 } : null);
        
        // Add a simulated thinking event
        setAgentState(prev => ({
          ...prev,
          events: [...prev.events, {
            type: 'thinking',
            content: 'Formulating response based on consumer rights information...',
            timestamp: Date.now()
          }]
        }));
      }, 3000);
      
      // Use regular API
      console.log('[useChat] Sending message with:', { content, sessionId, userId: user.id });
      // Ensure we have a valid user ID
      if (!user?.id) {
        throw new Error('User ID is missing. Please log in again.');
      }
      // Ensure we have a valid session ID
      if (!sessionId) {
        throw new Error('Session ID is missing. Unable to send message.');
      }
      console.log('[useChat] API URL being used:', API_BASE_URL);
      
      let response;
      try {
        response = await api.sendMessage(content, sessionId, user.id);
        console.log('[useChat] sendMessage response:', response);
      } catch (error) {
        console.error('[useChat] sendMessage error:', error);
        throw error;
      }
      if (response && response.data) {
        // The API returns the AI's message in the ChatMessage format.
        setMessages((prev: ChatMessage[]) => response.data ? [...prev, response.data] : prev);
      } else if (response && response.error) {
        // Display this error to the user
        setError(response.error.message);
      } else {
        setError('Received invalid response from server');
      }
      
      // Set agent state to inactive
      setAgentState(prev => ({ ...prev, isActive: false }));
    } catch (err) {
      setError('Failed to send message');
      setAgentState(prev => ({ ...prev, isActive: false }));
    } finally {
      setIsLoading(false);
      setProgress(null); // Clear progress when done
    }
  }, [user?.id, currentChatId]);

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