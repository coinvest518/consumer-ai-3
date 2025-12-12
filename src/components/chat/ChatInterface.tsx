import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Send, Loader2, Bot, User, Sparkles, X, Mic, Brain, Menu, ChevronLeft, Upload, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";

import AgentSelector from "./AgentSelector";
import { defaultTools } from "./ToolPanel";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import { cn } from "@/lib/utils";
import AgentActionDisplay from "./AgentActionDisplay";
import { supabase } from "@/lib/supabase";
import { trackFileUpload } from "@/lib/storageUtils";

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const setError = (error: string | null) => {
    // We can't directly set the error from useChat, so we'll handle it differently
    console.error('Upload error:', error);
  };

  const scrollToBottom = () => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
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

    // For report tool, don't show upload component anymore - upload button is in main chat
    // Just set the agent for when user asks questions about reports
    if (toolId === 'report' && toolId !== selectedTool) {
      setSelectedAgent('report');
      setSelectedTool('report');
    } else if (toolId === selectedTool) {
      setSelectedAgent(null);
      setSelectedTool(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      setIsUploading(true);
      setUploadedFile(file);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `credit-reports/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('users-file-storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Track the upload
      const success = await trackFileUpload(
        user.id,
        filePath,
        file.name,
        file.size,
        file.type,
        'users-file-storage'
      );

      if (!success) {
        await supabase.storage.from('users-file-storage').remove([filePath]);
        throw new Error('Failed to track file upload');
      }

      // Automatically trigger report agent with the file
      const agentMessage = `[Agent Request: report] Please analyze this credit report file: ${filePath}. The file has been uploaded and is ready for analysis.`;
      
      await sendMessage(agentMessage);
      setUploadedFile(null);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      
      if (!acceptedTypes.includes(file.type)) {
        setError('Please upload a PDF or image file (JPG, PNG)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('File size must be less than 10MB');
        return;
      }
      
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <div className="flex h-[calc(100vh-80px)] sm:h-[calc(100vh-80px)] bg-white relative mobile-chat-container">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 z-50",
        "fixed lg:relative inset-y-0 left-0",
        "w-80 lg:w-80",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">AI Tools</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-200 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <AgentSelector 
            onSelect={setSelectedAgent} 
            selectedAgent={selectedAgent} 
          />
        </div>

        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
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
                    "w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-left transition-colors touch-manipulation",
                    isSelected
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-100 active:bg-gray-200 text-gray-700"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0",
                    isSelected ? "text-blue-600" : "text-gray-500"
                  )} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{tool.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{tool.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>



        <div className="p-3 sm:p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setInputValue("What are my rights with debt collectors?");
                setIsSidebarOpen(false);
              }}
              className="w-full text-left p-2.5 sm:p-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors touch-manipulation"
            >
              Debt Collection Rights
            </button>
            <button 
              onClick={() => {
                setInputValue("How do I dispute errors on my credit report?");
                setIsSidebarOpen(false);
              }}
              className="w-full text-left p-2.5 sm:p-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors touch-manipulation"
            >
              Credit Report Disputes
            </button>
            <button 
              onClick={() => {
                setInputValue("What consumer protections do I have?");
                setIsSidebarOpen(false);
              }}
              className="w-full text-left p-2.5 sm:p-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors touch-manipulation"
            >
              Consumer Protection
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">ConsumerAI Assistant</h3>
              <p className="text-xs text-gray-500 hidden sm:block">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {selectedAgent && (
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{selectedAgent} agent active</span>
                <span className="sm:hidden">Agent</span>
                <button onClick={() => setSelectedAgent(null)} className="text-blue-500 hover:text-blue-700">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-600">AI-Powered</span>
            </div>
            <button
              onClick={() => window.open('https://buymeacoffee.com/coinvest/extras', '_blank')}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              title="Free Resources & Digital Products"
            >
              <Gift className="h-4 w-4" />
              <span className="text-xs font-medium">Free Resources</span>
            </button>
          </div>
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white mobile-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-4 p-2 sm:p-4">
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
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white border-t safe-area-bottom">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={selectedAgent ? `Ask ${selectedAgent} agent...` : "Type your message..."}
                className={cn(
                  "h-10 sm:h-12 text-sm sm:text-base rounded-xl border-2 transition-all duration-200 mobile-input",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "pr-24 sm:pr-28"
                )}
                disabled={isLoading || isUploading}
              />
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Speak your message"
                  onClick={handleVoiceInput}
                  className="bg-blue-100 rounded-full p-1.5 sm:p-2 hover:bg-blue-200 touch-manipulation"
                  disabled={isListening}
                >
                  <Mic className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4 text-blue-600",
                    isListening && "animate-pulse"
                  )} />
                </button>
                <button
                  type="button"
                  aria-label="Upload credit report"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 rounded-full p-1.5 sm:p-2 hover:bg-gray-200 touch-manipulation"
                  disabled={isLoading || isUploading}
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim() || isUploading}
              className={cn(
                "h-10 sm:h-12 px-3 sm:px-6 rounded-xl font-medium transition-all duration-200 touch-manipulation",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg hover:shadow-xl min-w-[44px]"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </form>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {isUploading && (
            <div className="mt-2 sm:mt-3 text-blue-600 text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading credit report...
            </div>
          )}
          
          {isListening && (
            <div className="mt-2 sm:mt-3 text-blue-600 text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse" /> Listening...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}