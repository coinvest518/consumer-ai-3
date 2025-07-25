import { useState, useEffect, useContext, createContext } from "react";
import { io, Socket } from "socket.io-client";
// Simple Socket.IO hook for agent steps
function useAgentSteps(sessionId: string) {
  const [steps, setSteps] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  // Only create socket once
  const [socket] = useState(() => io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"));

  useEffect(() => {
    if (!sessionId) return;
    socket.emit("join", sessionId);
    socket.on("agent-thinking-start", () => {
      setIsThinking(true);
      setSteps([]);
    });
    socket.on("agent-step", (step) => {
      setSteps((prev) => [...prev, step]);
    });
    socket.on("agent-thinking-complete", () => setIsThinking(false));
    socket.on("agent-thinking-error", () => setIsThinking(false));
    return () => {
      socket.off("agent-thinking-start");
      socket.off("agent-step");
      socket.off("agent-thinking-complete");
      socket.off("agent-thinking-error");
    };
    // eslint-disable-next-line
  }, [sessionId]);
  return { steps, isThinking };
}
import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Clock, Sparkles } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import AgentIndicator from "./AgentIndicator";

// Global mute context for AI voice
export const AIVoiceMuteContext = createContext<{ muted: boolean; setMuted: (m: boolean) => void }>({ muted: false, setMuted: () => {} });

interface ChatMessageProps {
  message: ChatMessageType;
  shouldSpeakAI?: boolean;
}

export default function ChatMessage({ message, shouldSpeakAI }: ChatMessageProps) {
  const { muted } = useContext(AIVoiceMuteContext);
  const isUser = message.role === 'user';
  const [showTrace, setShowTrace] = useState(false);
  // Live agent steps (only for AI messages)
  // Use a static session key if message.sessionId does not exist
  const { steps, isThinking } = !isUser ? useAgentSteps("chat-session") : { steps: [], isThinking: false };

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
    // ...existing TTS logic...
  }, [message, shouldSpeakAI, muted]);

  return (
    <div className={cn(
      "flex w-full gap-2 sm:gap-3 px-1 sm:px-0",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Message Content */}
      <div className={cn(
        "max-w-[90vw] sm:max-w-[80%] space-y-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Live Agent Steps (for AI messages) */}
        {!isUser && (isThinking || steps.length > 0) && (
          <div className="mb-2">
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>Agent Process</span>
              {isThinking && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1"></div>
              )}
            </button>
            {showTrace && (
              <div className="mt-2 space-y-1 border border-gray-200 rounded-lg p-2 bg-gray-50 text-xs">
                {steps.map((step, index) => (
                  <div key={step.id || index} className="flex items-start gap-2 p-2 bg-white rounded border">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{step.title}</div>
                      <div className="text-gray-600">{step.description}</div>
                      <div className="text-gray-400">{step.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded">
                    <span className="text-gray-500">Agent is thinking...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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