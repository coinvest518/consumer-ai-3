import { useState, useEffect, useContext, createContext, useRef } from "react";
import { cn } from "@/lib/utils";
import { FormattedMessage } from "./FormattedMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Clock, Sparkles, Download } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import AgentIndicator from "./AgentIndicator";
import html2pdf from 'html2pdf.js';

export const AIVoiceMuteContext = createContext<{ muted: boolean; setMuted: (m: boolean) => void }>({ muted: false, setMuted: () => {} });

interface ChatMessageProps {
  message: ChatMessageType;
  shouldSpeakAI?: boolean;
}

export default function ChatMessage({ message, shouldSpeakAI }: ChatMessageProps) {
  const { muted } = useContext(AIVoiceMuteContext);
  const isUser = message.role === 'user';
  const [isHovered, setIsHovered] = useState(false);

  if (!message || !message.content) {
    console.warn('ChatMessage received invalid message (missing content):', message);
    return null;
  }

  const isIntegration = typeof message.content === 'string' && (message.content.includes('This is an integration, not an AI agent') || message.content.includes('[Integration]'));

  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    // TTS logic placeholder
  }, [message, shouldSpeakAI, muted]);

  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const handleExportPDF = async () => {
    if (!bubbleRef.current) return;
    try {
      const element = bubbleRef.current.cloneNode(true) as HTMLElement;
      element.querySelectorAll('button, .no-print').forEach((el) => el.remove());
      const wrapper = document.createElement('div');
      wrapper.style.padding = '20px';
      wrapper.style.background = 'white';
      wrapper.appendChild(element);

      const opt = {
        margin: 10,
        filename: `ai-response-${message.id || Date.now()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      (html2pdf() as any).set(opt).from(wrapper).save();
    } catch (err) {
      console.error('PDF export failed', err);
    }
  };

  return (
    <div className={cn(
      "flex w-full gap-2 sm:gap-3 px-2 sm:px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "justify-end" : "justify-start"
    )}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 pt-1">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-white shadow-md ring-2 ring-blue-100">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-1.5",
        isUser ? "items-end" : "items-start",
        "max-w-[85vw] sm:max-w-[70%]"
      )}>
        {/* Message Bubble */}
        <div 
          ref={bubbleRef}
          className={cn(
            "px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-sm transition-all duration-200",
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none hover:shadow-md"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-none hover:shadow-md hover:border-gray-300"
          )}
        >
          {!isUser && <AgentIndicator content={message.content} />}
          {isIntegration && (
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
              <Sparkles className="h-3.5 w-3.5" />
              Integration Tool
            </div>
          )}
          <div className="text-sm sm:text-base leading-relaxed">
            <FormattedMessage content={message.content} isAI={!isUser} />
          </div>
        </div>

        {/* Metadata Row */}
        <div className={cn(
          "flex items-center gap-2 text-xs sm:text-sm text-gray-500 px-1 transition-opacity duration-200",
          isUser ? "justify-end" : "justify-start",
          isHovered ? "opacity-100" : "opacity-70"
        )}>
          <Clock className="h-3 w-3" />
          <span className="font-medium">{time}</span>
          {!isUser && (
            <button
              onClick={handleExportPDF}
              className="ml-2 sm:ml-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-150 no-print"
              title="Download this response as PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 pt-1">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-white shadow-md ring-2 ring-green-100">
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
