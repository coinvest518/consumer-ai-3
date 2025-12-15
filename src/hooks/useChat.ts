import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import socket from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { ChatMessage } from "@/types/api";
import { AgentEvent } from "@/lib/agentCallbacks";
import { supabase } from "@/lib/supabase";

// Agent state for tracking agent actions
export interface AgentState {
  isActive: boolean;
  events: AgentEvent[];
}

const initialMessage: ChatMessage = {
  id: "0-ai",
  content: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
  role: "assistant",
  created_at: new Date().toISOString()
};

/**
 * Centralized chat state management for a single active chat session.
 * Handles loading chat history and sending messages.
 */
export function useChat(onCreditsUpdate?: () => void) {
  const { user } = useAuth();
  const { isConnected, socketId } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  // Track if AI should speak its response
  const [shouldSpeakAI, setShouldSpeakAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false,
    events: []
  });

  // Log socket connection status
  useEffect(() => {
    console.log('[useChat] Socket connection status:', { isConnected, socketId });
  }, [isConnected, socketId]);

  // Socket event listeners for agent activity
  useEffect(() => {
    if (!socket) return;

    const handleAgentStep = (data: any) => {
      console.log('[Socket] Agent step:', data);
      setAgentState(prev => ({
        isActive: true,
        events: [...prev.events, {
          type: 'agent_action',
          name: data.tool || data.action || 'Processing',
          content: data.toolInput || data.input || data.message || 'Working...',
          data: data,
          timestamp: Date.now()
        }]
      }));
    };

    const handleThinkingStart = (data?: any) => {
      console.log('[Socket] Thinking start:', data);
      setAgentState({ 
        isActive: true, 
        events: [{
          type: 'thinking',
          name: 'AI Assistant',
          content: 'Analyzing your request...',
          timestamp: Date.now()
        }] 
      });
    };

    const handleThinkingComplete = (data: any) => {
      console.log('[Socket] Thinking complete:', data);
      setAgentState(prev => ({ ...prev, isActive: false }));
      
      // Add the AI response message if provided
      if (data && (data.response || data.message || data.content)) {
        const aiMessage: ChatMessage = {
          id: data.messageId || `${Date.now()}-ai`,
          content: data.response || data.message || data.content,
          role: "assistant",
          created_at: data.created_at || new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    };

    const handleThinkingError = (error: string) => {
      console.error('[Socket] Thinking error:', error);
      setAgentState({ isActive: false, events: [] });
      setError(error);
    };

    const handleAgentAction = (data: any) => {
      console.log('[Socket] Agent action:', data);
      setAgentState(prev => ({
        isActive: true,
        events: [...prev.events, {
          type: 'agent_action',
          name: data.agent || data.tool || 'Agent',
          content: data.action || data.message || 'Processing...',
          data: data,
          timestamp: Date.now()
        }]
      }));
    };

    const handleToolUse = (data: any) => {
      console.log('[Socket] Tool use:', data);
      setAgentState(prev => ({
        isActive: true,
        events: [...prev.events, {
          type: 'tool_start',
          name: data.tool || 'Tool',
          content: data.input || 'Using tool...',
          data: data,
          timestamp: Date.now()
        }]
      }));
    };

    // Listen for various socket events that might be emitted by the backend
    socket.on('agent-step', handleAgentStep);
    socket.on('agent-thinking-start', handleThinkingStart);
    socket.on('agent-thinking-complete', handleThinkingComplete);
    socket.on('agent-thinking-error', handleThinkingError);
    socket.on('agent-action', handleAgentAction);
    socket.on('tool-use', handleToolUse);
    socket.on('thinking', handleThinkingStart);
    socket.on('processing', handleAgentAction);

    return () => {
      socket.off('agent-step', handleAgentStep);
      socket.off('agent-thinking-start', handleThinkingStart);
      socket.off('agent-thinking-complete', handleThinkingComplete);
      socket.off('agent-thinking-error', handleThinkingError);
      socket.off('agent-action', handleAgentAction);
      socket.off('tool-use', handleToolUse);
      socket.off('thinking', handleThinkingStart);
      socket.off('processing', handleAgentAction);
    };
  }, []);

  useEffect(() => {
    if (user?.id && user.id !== currentChatId) {
      setCurrentChatId(user.id);
      setIsLoading(true);
      api.getChatHistory(user.id, user.id)
        .then(historyResponse => {
          if (historyResponse.data && Array.isArray(historyResponse.data) && historyResponse.data.length > 0) {
            const transformed: ChatMessage[] = historyResponse.data
              .map((entry: any) => ({
                id: entry.id || entry._id || `${entry.created_at}-${entry.role}`,
                content: entry.content || entry.message || entry.response || entry.text || '',
                role: entry.role || (entry.response ? 'assistant' : 'user'),
                created_at: entry.created_at,
              }))
              .filter((msg: ChatMessage) => !!msg.content && msg.content.trim() !== '');
            setMessages(transformed.length > 0 ? transformed : [initialMessage]);
          } else {
            setMessages([initialMessage]);
          }
        })
        .catch(() => {
          setError('Failed to load chat history.');
          setMessages([initialMessage]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!user?.id) {
        setMessages([initialMessage]);
        setCurrentChatId(null);
    }
  }, [user?.id, currentChatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
        // Prevent adding empty user messages
        return;
    }
    if (!currentChatId || !user?.id) {
        setError('User not authenticated or chat session not started.');
        return;
    }

    // Check if user has enough credits (1 credit per message)
    try {
      const creditsResponse = await fetch('/api/user/credits', {
        method: 'GET',
        headers: {
          'user-id': user.id
        }
      });
      
      if (!creditsResponse.ok) {
        console.warn('Credits API returned error:', creditsResponse.status);
        // Allow message if API is down - don't block users
      } else {
        const creditsData = await creditsResponse.json();
        
        if (creditsData.credits < 1) {
          setError('Insufficient credits. You need at least 1 credit to send a message.');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking credits:', error);
      // Allow message if credit check fails - don't block users due to API issues
    }

    setIsLoading(true);
    setError(null);
    
    // Start with thinking state
    setAgentState({ 
      isActive: true, 
      events: [{
        type: 'thinking',
        name: 'AI Assistant',
        content: 'Processing your request...',
        timestamp: Date.now()
      }] 
    });

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      content: content,
      role: "user",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate agent thinking process if no real-time updates
    const thinkingTimeout = setTimeout(() => {
      setAgentState(prev => ({
        isActive: true,
        events: [...prev.events, {
          type: 'agent_action',
          name: 'Legal Database',
          content: 'Searching consumer law database...',
          timestamp: Date.now()
        }]
      }));
    }, 1000);

    const analysisTimeout = setTimeout(() => {
      setAgentState(prev => ({
        isActive: true,
        events: [...prev.events, {
          type: 'agent_action',
          name: 'Analysis Agent',
          content: 'Analyzing legal precedents...',
          timestamp: Date.now()
        }]
      }));
    }, 2500);

    try {
      console.log('[useChat] Sending message with socket ID:', socketId, 'Connected:', isConnected);
      
      const response = await api.sendMessage(content, user.id, user.id, socketId || undefined);
      
      // Clear timeouts since we got a response
      clearTimeout(thinkingTimeout);
      clearTimeout(analysisTimeout);
      
      if (response && response.data) {
        const aiMessage: ChatMessage = {
          id: response.data.messageId || `${Date.now()}-ai`,
          content: response.data.message || response.data.content || response.data.response,
          role: "assistant",
          created_at: response.data.created_at || new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        // After AI response, reset shouldSpeakAI to false
        setShouldSpeakAI(false);
        
        // Deduct 1 credit and increment chat usage
        try {
          // Get current values first
          const [creditsResult, metricsResult] = await Promise.all([
            supabase.from('user_credits').select('credits').eq('user_id', user.id).single(),
            supabase.from('user_metrics').select('chats_used').eq('user_id', user.id).single()
          ]);

          const currentCredits = creditsResult.data?.credits || 0;
          const currentChatsUsed = metricsResult.data?.chats_used || 0;

          // Deduct credit from user_credits
          await supabase
            .from('user_credits')
            .update({ 
              credits: currentCredits - 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          // Increment chats_used in user_metrics
          await supabase
            .from('user_metrics')
            .update({ 
              chats_used: currentChatsUsed + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          console.log('Credit deducted and chat usage incremented for user:', user.id);
        } catch (creditError) {
          console.error('Error updating credits/usage:', creditError);
          // Don't fail the chat if credit update fails
        }

        // Notify parent component that credits were updated
        if (onCreditsUpdate) {
          onCreditsUpdate();
        }
        
        // Refresh chat history to ensure sync
        try {
          const historyResponse = await api.getChatHistory(user.id, user.id);
          if (historyResponse.data && Array.isArray(historyResponse.data) && historyResponse.data.length > 0) {
            const transformed: ChatMessage[] = historyResponse.data
              .map((entry: any) => ({
                id: entry.id || entry._id || `${entry.created_at}-${entry.role}`,
                content: entry.content || entry.message || entry.response || entry.text || '',
                role: entry.role || (entry.response ? 'assistant' : 'user'),
                created_at: entry.created_at,
              }))
              .filter((msg: ChatMessage) => !!msg.content && msg.content.trim() !== '');
            setMessages(transformed.length > 0 ? transformed : [initialMessage]);
          }
        } catch (refreshError) {
          console.warn('Failed to refresh chat history after message:', refreshError);
          // Keep the locally added messages if refresh fails
        }
      } else {
        throw new Error(response?.error?.message || 'Invalid response from server');
      }
    } catch (err: any) {
      clearTimeout(thinkingTimeout);
      clearTimeout(analysisTimeout);
      console.error('[useChat] Send message error:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
      setAgentState({ isActive: false, events: [] });
    }
  }, [currentChatId, user?.id]);
  
  const loadChatById = useCallback(async (chatId: string) => {
    if (!chatId || !user?.id) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getChatHistory(chatId, user.id);
      if (response.data && Array.isArray(response.data)) {
        const transformed: ChatMessage[] = response.data.map((entry: any) => ({
            id: entry.id || entry._id || `${entry.created_at}-${entry.role}`,
            content: entry.content || entry.message || entry.response || entry.text || '',
            role: entry.role || (entry.response ? 'assistant' : 'user'),
            created_at: entry.created_at,
        }));
        setMessages(transformed.length > 0 ? transformed : [initialMessage]);
      } else {
        setMessages([initialMessage]);
      }
    } catch (err) {
      setError('Failed to load chat history.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);


  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadChatById,

    agentState,
    shouldSpeakAI,
    setShouldSpeakAI,
  };
}
