import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Send, Loader2, Bot, User, Sparkles, X, Mic, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";

import AgentSelector from "./AgentSelector";
import { defaultTools } from "./ToolPanel";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import { cn } from "@/lib/utils";
import AgentActionDisplay from "./AgentActionDisplay";

interface ChatInterfaceProps {
  messages?: ChatMessageType[];
  onSendMessage?: (content: string) => Promise<void>;
  isLoading?: boolean;
  showProgress?: boolean;
  initialTemplate?: any;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  const chatHook = useChat();
  const { user } = useAuth();

  const [inputValue, setInputValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    recognition.onstart = () => {
      setIsListening(true);
      timeoutId = setTimeout(() => recognition.stop(), 30000);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      clearTimeout(timeoutId);
      chatHook.setShouldSpeakAI(true);
      if (transcript.trim()) {
        handleSubmit({ preventDefault: () => {} } as any);
      }
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      clearTimeout(timeoutId);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutId);
    };
    
    recognition.start();
  };

  const messages = props.messages !== undefined ? props.messages : chatHook.messages;
  const sendMessage = props.onSendMessage !== undefined ? props.onSendMessage : chatHook.sendMessage;
  const isLoading = props.isLoading !== undefined ? props.isLoading : chatHook.isLoading;
  const error = chatHook.error;
  const agentState = chatHook.agentState;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      console.error("Chat error:", error);
    }
  }, [error]);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId === selectedTool ? null : toolId);
    setSelectedAgent(toolId === selectedTool ? null : toolId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (isListening) {
      setIsListening(false);
    }

    let message = inputValue.trim();
    
    if (selectedAgent) {
      const agentPrefix = {
        'search': 'Use the search agent to find information about: ',
        'calendar': 'Use the calendar agent to set a reminder for: ',
        'report': 'Use the report analysis agent to analyze this credit report: ',
        'letter': 'Use the letter generator agent to create a dispute letter for: ',
        'legal': 'Use the legal database agent to find legal information about: ',
        'email': 'Use the email agent to send a notification about: ',
        'tracking': 'Use the tracking agent to track this certified mail number: '
      }[selectedAgent];
      
      if (agentPrefix) {
        message = `[Agent Request: ${selectedAgent}] ${agentPrefix}${message}`;
      }
    }
    
    setInputValue("");
    
    try {
      await sendMessage(message);
      setSelectedAgent(null);
      setSelectedTool(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white">
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900">AI Tools</span>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <AgentSelector 
            onSelect={setSelectedAgent} 
            selectedAgent={selectedAgent} 
          />
        </div>

        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Tools</h3>
          <div className="space-y-2">
            {defaultTools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isSelected ? "text-blue-600" : "text-gray-500"
                  )} />
                  <div>
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{tool.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>



        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setInputValue("What are my rights with debt collectors?")}
              className="w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Debt Collection Rights
            </button>
            <button 
              onClick={() => setInputValue("How do I dispute errors on my credit report?")}
              className="w-full text-left p-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Credit Report Disputes
            </button>
            <button 
              onClick={() => setInputValue("What consumer protections do I have?")}
              className="w-full text-left p-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              Consumer Protection
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">ConsumerAI Assistant</h3>
              <p className="text-xs text-gray-500">Online • Ready to help</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {selectedAgent && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <Bot className="h-4 w-4" />
                <span>{selectedAgent} agent active</span>
                <button onClick={() => setSelectedAgent(null)} className="text-blue-500 hover:text-blue-700">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-600">AI-Powered</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-4 p-4">
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {(messages.length === 0) ? (
              <ChatMessage
                message={{
                  id: "0-ai",
                  content: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
                  role: "assistant",
                  created_at: new Date().toISOString()
                }}
              />
            ) : (
              messages.map((message, index) => {
                const formattedMessage = {
                  ...message,
                  content: message.content || (message as any).text || (message as any).message || '',
                };
                const shouldSpeakAI = formattedMessage.role === 'assistant' ? chatHook.shouldSpeakAI : false;
                return <ChatMessage key={message.id || index} message={formattedMessage} shouldSpeakAI={shouldSpeakAI} />;
              })
            )}

            {(isLoading || agentState.isActive) && (
              <div className="flex justify-center">
                <AgentActionDisplay events={agentState.events} isActive={agentState.isActive} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={selectedAgent ? `Ask ${selectedAgent} agent...` : "Type your message..."}
                className={cn(
                  "h-12 text-base rounded-xl border-2 transition-all duration-200 pr-20",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                aria-label="Speak your message"
                onClick={handleVoiceInput}
                className="absolute right-12 top-1/2 -translate-y-1/2 bg-blue-100 rounded-full p-2 hover:bg-blue-200"
                disabled={isListening}
              >
                <Mic className={cn(
                  "h-4 w-4 text-blue-600",
                  isListening && "animate-pulse"
                )} />
              </button>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <User className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                "h-12 px-6 rounded-xl font-medium transition-all duration-200",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg hover:shadow-xl"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          
          {isListening && (
            <div className="mt-3 text-blue-600 text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse" /> Listening...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}