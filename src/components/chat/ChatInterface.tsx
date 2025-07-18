import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, Upload, X, Eye, EyeOff } from "lucide-react";
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
    e.stopPropagation(); // Prevent event bubbling
    if (!inputValue.trim() || isLoading) return;

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
    <div className="flex h-[calc(100vh-12rem)] max-w-6xl mx-auto">
      {/* Tool Panel */}
      <ToolPanel
        expanded={toolPanelExpanded}
        onToggle={() => setToolPanelExpanded(!toolPanelExpanded)}
        tools={defaultTools}
        onSelectTool={handleToolSelect}
        selectedTool={selectedTool}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-white/80 backdrop-blur-sm rounded-t-xl">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentActivity(!showAgentActivity)}
              className="flex items-center gap-1 text-xs h-8"
            >
              {showAgentActivity ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Hide Activity
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Show Activity
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
              Upload
            </Button>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-600">AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="space-y-4 p-4">
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
                console.log('[ChatInterface] formatted message:', formattedMessage);
                return <ChatMessage key={message.id || index} message={formattedMessage} />;
              })
            )}
            {/* Show agent activity when available */}
            {showAgentActivity && agentState && agentState.isActive && agentState.events.length > 0 && (
              <div className="animate-pulse-once">
                <AgentActionDisplay events={agentState.events} />
              </div>
            )}
            
            {/* Show thinking animation when loading */}
            {isLoading && (
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
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about consumer rights, credit reports, debt collection..."
                disabled={isLoading}
                className={cn(
                  "pr-12 h-12 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                "h-12 px-6 rounded-xl font-medium transition-all duration-200",
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
          
          {/* Quick Actions and Agent Selector */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <AgentSelector 
              onSelect={setSelectedAgent} 
              selectedAgent={selectedAgent} 
            />
            
            <div className="h-5 border-l border-gray-200 mx-1"></div>
            
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