import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, Upload, X, Eye, EyeOff, Mic } from "lucide-react";
import VoiceInput from './VoiceInput';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";
import ThinkingAnimation from "./ThinkingAnimation";
import AgentSelector from "./AgentSelector";
import { ToolPanel, defaultTools } from "./ToolPanel";
import { FileUploadZone } from "@/components/ui/file-upload";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage as ChatMessageType } from "@/types/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import AgentActionDisplay from "./AgentActionDisplay";

interface ChatInterfaceProps {
  messages?: ChatMessageType[];
  onSendMessage?: (content: string) => Promise<void>;
  isLoading?: boolean;
  showProgress?: boolean;
  initialTemplate?: any;
}

export default function ChatInterface(props: ChatInterfaceProps) {
  // Use props if provided, otherwise useChat hook
  const chatHook = useChat();
  const [inputValue, setInputValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [toolPanelExpanded, setToolPanelExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  // For voice prompt
  const speakPrompt = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  // Speech recognition logic
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    speakPrompt('Please speak your message now.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let timeoutId: ReturnType<typeof setTimeout>;
    recognition.onstart = () => {
      setIsListening(true);
      // Stop after 30 seconds if not finished
      timeoutId = setTimeout(() => {
        recognition.stop();
      }, 30000);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      clearTimeout(timeoutId);
      // Set shouldSpeakAI true when sending via voice
      chatHook.setShouldSpeakAI(true);
      // Optionally auto-send after voice input
      if (transcript.trim()) {
        handleSubmit({ preventDefault: () => {} } as any);
      }
    };
    recognition.onerror = (event) => {
      alert('Speech recognition error: ' + event.error);
      setIsListening(false);
      clearTimeout(timeoutId);
    };
    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutId);
    };
    recognition.start();
  };

  const handleTranscriptChange = (transcript: string) => {
    setInputValue(transcript);
  };

  // Always prefer props if provided, else fallback to hook
  const messages = props.messages !== undefined ? props.messages : chatHook.messages;
  const sendMessage = props.onSendMessage !== undefined ? props.onSendMessage : chatHook.sendMessage;
  const isLoading = props.isLoading !== undefined ? props.isLoading : chatHook.isLoading;
  const showProgress = props.showProgress !== undefined ? props.showProgress : false;
  const error = chatHook.error;
  const agentState = chatHook.agentState;
  const [showAgentActivity, setShowAgentActivity] = useState(true); // Show agent activity by default

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show error in console if it occurs
  useEffect(() => {
    if (error) {
      console.error("Chat error:", error);
    }
  }, [error]);

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    // In a real implementation, you would upload the files to a server
    console.log("Files to upload:", files);
    
    // For now, just close the modal and set the input value to indicate a file was uploaded
    setShowUploadModal(false);
    setInputValue(`I've uploaded ${files.length} file(s): ${files.map(f => f.name).join(", ")}. Please analyze this document.`);
  };
  
  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    if (toolId === "upload") {
      setShowUploadModal(true);
      return;
    }
    
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
    
    // If an agent is selected, prepend the agent directive
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
    
    setInputValue(""); // Clear input immediately for better UX
    
    // Use try-catch to handle any errors during message sending
    try {
      console.log("Sending message with content:", message);
      await sendMessage(message);
      // Reset selected agent after sending
      setSelectedAgent(null);
      setSelectedTool(null);
    } catch (error) {
      console.error("Error sending message:", error);
      // Error is already handled in the useChat hook
    }
  };



  return (
    <div className="flex flex-col md:flex-row h-[100dvh] md:h-[calc(100vh-12rem)] max-w-full md:max-w-6xl mx-auto bg-white md:bg-transparent">
      {/* Tool Panel */}
      <div className="md:block w-full md:w-auto order-2 md:order-1">
        <ToolPanel
          expanded={toolPanelExpanded}
          onToggle={() => setToolPanelExpanded(!toolPanelExpanded)}
          tools={defaultTools}
          onSelectTool={handleToolSelect}
          selectedTool={selectedTool}
          className="md:h-full md:min-h-0 min-h-[56px]"
        />
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col order-1 md:order-2 min-h-0 bg-white">
        {/* Chat Header */}
        <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b bg-white/80 backdrop-blur-sm rounded-t-xl sticky top-0 z-10">
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
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentActivity(!showAgentActivity)}
              className="flex items-center gap-1 text-xs h-8"
            >
              {showAgentActivity ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Hide Activity</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Show Activity</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1 text-xs h-8"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-600">AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white min-h-0 max-h-[40vh] md:max-h-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-3 p-2 md:p-4">
            {/* Error Display */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {/* Render messages, ensuring they have a 'content' property */}
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
                // Ensure message format is consistent for ChatMessage component
                const formattedMessage = {
                  ...message,
                  // If content is missing, try to use 'text' or 'message' property as a fallback.
                  content: message.content || (message as any).text || (message as any).message || '',
                };
                // Pass shouldSpeakAI only to AI messages
                const shouldSpeakAI = formattedMessage.role === 'assistant' ? chatHook.shouldSpeakAI : false;
                return <ChatMessage key={message.id || index} message={formattedMessage} shouldSpeakAI={shouldSpeakAI} />;
              })
            )}
            {/* Show agent activity when available */}
            {showAgentActivity && agentState && agentState.isActive && agentState.events.length > 0 && (
              <div className="animate-pulse-once">
                <AgentActionDisplay events={agentState.events} />
              </div>
            )}
            
            {/* Show thinking animation when loading */}
            {(showProgress && isLoading) && (
              <div className="mt-4 flex justify-center">
                {chatHook.progress ? (
                  <ThinkingAnimation progress={chatHook.progress} />
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-md border">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-2 md:p-4 bg-white border-t sticky bottom-0 z-10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative flex items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className={cn(
                  "h-11 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
              <button
                type="button"
                aria-label="Speak your message"
                onClick={handleVoiceInput}
                className="absolute right-10 top-1/2 -translate-y-1/2 bg-blue-100 rounded-full p-2 hover:bg-blue-200"
                disabled={isListening}
              >
                <Mic className="h-5 w-5 text-blue-600" />
              </button>
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                "h-11 px-4 md:px-6 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg hover:shadow-xl transform hover:scale-105"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          {/* Voice connection state */}
          {isListening && (
            <div className="mt-2 text-blue-600 text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse" /> Listening...
            </div>
          )}
          {/* Quick Actions and Agent Selector */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
            <AgentSelector 
              onSelect={setSelectedAgent} 
              selectedAgent={selectedAgent} 
            />
            <div className="hidden sm:block h-5 border-l border-gray-200 mx-1"></div>
            <button 
              onClick={() => setInputValue("What are my rights with debt collectors?")}
              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
            >
              Debt Collection Rights
            </button>
            <button 
              onClick={() => setInputValue("How do I dispute errors on my credit report?")}
              className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
            >
              Credit Report Disputes
            </button>
            <button 
              onClick={() => setInputValue("What consumer protections do I have?")}
              className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
            >
              Consumer Protection
            </button>
          </div>
        </div>
        
        {/* File Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Upload Document</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <FileUploadZone
                  acceptedFileTypes={['application/pdf', 'image/*']}
                  maxFileSize={10 * 1024 * 1024} // 10MB
                  onUpload={handleFileUpload}
                  showPreview={true}
                />
                
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowUploadModal(false)}
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}