import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Clock, Sparkles } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import AgentIndicator from "./AgentIndicator";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
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
