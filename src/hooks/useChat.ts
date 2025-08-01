import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import socket from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/api";
import { AgentEvent } from "@/lib/agentCallbacks";

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
export function useChat() {
  const { user } = useAuth();
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

  // Socket event listeners for agent activity
  useEffect(() => {
    if (!socket) return;

    const handleAgentStep = (data: any) => {
      setAgentState(prev => ({
        isActive: true,
        events: [...prev.events, {
          type: 'agent_action',
          name: data.tool,
          content: data.toolInput,
          data: data,
          timestamp: Date.now()
        }]
      }));
    };

    const handleThinkingStart = () => {
      setAgentState({ isActive: true, events: [] });
    };

    const handleThinkingComplete = (data: any) => {
      setAgentState(prev => ({ ...prev, isActive: false }));
    };

    const handleThinkingError = (error: string) => {
      setAgentState({ isActive: false, events: [] });
      setError(error);
    };

    socket.on('agent-step', handleAgentStep);
    socket.on('agent-thinking-start', handleThinkingStart);
    socket.on('agent-thinking-complete', handleThinkingComplete);
    socket.on('agent-thinking-error', handleThinkingError);

    return () => {
      socket.off('agent-step', handleAgentStep);
      socket.off('agent-thinking-start', handleThinkingStart);
      socket.off('agent-thinking-complete', handleThinkingComplete);
      socket.off('agent-thinking-error', handleThinkingError);
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

    setIsLoading(true);
    setError(null);
    setAgentState({ isActive: true, events: [] });

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      content: content,
      role: "user",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // If sending via voice, set shouldSpeakAI to true. You must set this in your voice input handler.
    // Example: setShouldSpeakAI(true) when user sends via voice.

    try {
      const socketId = socket.id;
      const response = await api.sendMessage(content, user.id, user.id, socketId);
      if (response && response.data) {
        const aiMessage: ChatMessage = {
          id: response.data.messageId || `${Date.now()}-ai`,
          content: response.data.message,
          role: "assistant",
          created_at: response.data.created_at || new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        // After AI response, reset shouldSpeakAI to false
        setShouldSpeakAI(false);
      } else {
        throw new Error(response.error?.message || 'Invalid response from server');
      }
    } catch (err: any) {
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
