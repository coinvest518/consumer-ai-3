import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Clock } from "lucide-react";
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

  const time = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={cn(
      "flex w-full gap-3",
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
        "max-w-[80%] space-y-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "relative px-4 py-3 rounded-2xl shadow-sm border",
          isUser 
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto rounded-br-sm" 
            : "bg-white text-gray-800 rounded-bl-sm"
        )}>
          {!isUser && <AgentIndicator content={message.content} />}
          <FormattedMessage content={message.content} isAI={!isUser} />
          
          {/* Message tail */}
          <div className={cn(
            "absolute bottom-0 w-3 h-3",
            isUser 
              ? "right-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-bl-full" 
              : "left-0 bg-white border-l border-b rounded-br-full"
          )}></div>
        </div>

        {/* Timestamp */}
        <div className={cn(
          "flex items-center gap-1 text-xs text-gray-500 px-2",
          isUser ? "justify-end" : "justify-start"
        )}>
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
      </div>

      {/* User Avatar (right side) */}
      {isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
