import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Clock, Sparkles } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import AgentIndicator from "./AgentIndicator";
import { useEffect, useContext, createContext } from "react";

// Global mute context for AI voice
export const AIVoiceMuteContext = createContext<{ muted: boolean; setMuted: (m: boolean) => void }>({ muted: false, setMuted: () => {} });
interface ChatMessageProps {
  message: ChatMessageType;
  shouldSpeakAI?: boolean;
}

export default function ChatMessage({ message, shouldSpeakAI }: ChatMessageProps) {
  const { muted } = useContext(AIVoiceMuteContext);
  const isUser = message.role === 'user';
  // Safety check for message structure
  if (!message || !message.content) {
    console.warn('ChatMessage received invalid message (missing content):', message);
    return null;
  }
  // Debug: log every message received by ChatMessage
  console.log('[ChatMessage] rendering message:', message);

  // Detect if this message is a tool/integration suggestion (not an AI agent action)
  // We'll use a simple convention: if the message contains a special marker, e.g. [Integration]
  const isIntegration =
    typeof message.content === 'string' &&
    (
      message.content.includes('This is an integration, not an AI agent') ||
      message.content.includes('[Integration]')
    );

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Text-to-speech for AI responses
  // Prevent speech on initial page load
  useEffect(() => {
    // Only speak if this is a new AI message (not the first assistant greeting)
    // We'll check if the message.id does NOT end with "0-ai" (the default greeting)
    if (
      !isUser &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      message.content &&
      !muted &&
      !isIntegration &&
      message.id !== '0-ai' &&
      shouldSpeakAI // Only speak if shouldSpeakAI is true
    ) {
      const utter = new window.SpeechSynthesisUtterance(message.content);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
    // Optionally, cancel on unmount
    return () => {
      if (!isUser && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content, muted, shouldSpeakAI]);

  return (
    <div className={cn(
      "flex w-full gap-2 sm:gap-3 px-1 sm:px-0",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI Avatar (left side) */}
      {!isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[90vw] sm:max-w-[80%] space-y-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "relative px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm border text-sm sm:text-base",
          isUser
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm"
        )}>
          {!isUser && <AgentIndicator content={message.content} />}
          {isIntegration && (
            <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full w-fit">
              <Sparkles className="h-3 w-3" />
              Integration Tool
            </div>
          )}
          <FormattedMessage content={message.content} isAI={!isUser} />
          {/* Message tail */}
          <div className={cn(
            "absolute bottom-0 w-2.5 h-2.5 sm:w-3 sm:h-3",
            isUser
              ? "right-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-bl-full"
              : "left-0 bg-white border-l border-b rounded-br-full"
          )}></div>
        </div>

        {/* Timestamp */}
        <div className={cn(
          "flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 px-1 sm:px-2",
          isUser ? "justify-end" : "justify-start"
        )}>
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
      </div>

      {/* User Avatar (right side) */}
      {isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
