
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat/ChatInterface";
import { useChat } from "@/hooks/useChat";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ElevenLabsChatbot from "@/components/ElevenLabsChatbot";





const Chat = () => {

  const { chatId } = useParams<{ chatId: string }>();
  const { messages, sendMessage, isLoading, loadChatById } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [initialTemplate, setInitialTemplate] = useState<any>(null);


  // Show toast if template is present in location.state
  useEffect(() => {
    if (location.state && location.state.template) {
      setInitialTemplate(location.state.template);
      toast({
        title: "Template Applied",
        description: `"${location.state.template.name}" is ready to use`,
      });
    }
  }, [location.state, toast]);

  // Load chat history for a specific chatId using useChat
  useEffect(() => {
    if (chatId && loadChatById) {
      loadChatById(chatId);
    }
  }, [chatId, loadChatById]);

  function handleDashboardClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    navigate("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 min-h-screen relative"
    >


      {/* Main header and content */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleDashboardClick}
              className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base p-2 sm:p-3 touch-manipulation"
            >
              ← <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] mobile-chat-container">
        <ChatInterface 
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          showProgress={true}
          initialTemplate={initialTemplate}
        />
      </main>
      
      <ElevenLabsChatbot />
    </motion.div>
  );
}

export default Chat;
