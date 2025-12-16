import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage } from '@/types/api';
import { AgentEvent } from '@/lib/agentCallbacks';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadChatById: (chatId: string) => Promise<void>;
  agentState: {
    isActive: boolean;
    events: AgentEvent[];
  };
  shouldSpeakAI: boolean;
  setShouldSpeakAI: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  onCreditsUpdate?: () => void;
}

export function ChatProvider({ children, onCreditsUpdate }: ChatProviderProps) {
  const chatState = useChat(onCreditsUpdate, { autoLoadHistory: true });

  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}