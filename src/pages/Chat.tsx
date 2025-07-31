
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat/ChatInterface";
import CreditScoreSimulator from "@/components/ui/CreditScoreSimulator";
import { useChat } from "@/hooks/useChat";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";





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
      className="bg-gray-50 relative"
    >


      {/* Main header and content */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleDashboardClick}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Credit Score Simulator at the top */}
          <div className="max-w-3xl mx-auto mb-8">
            <CreditScoreSimulator userName="User" />
          </div>
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
            <ChatInterface 
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              showProgress={true}
              initialTemplate={initialTemplate}
            />
          </div>
        </div>
      </main>
    </motion.div>
  );
}

export default Chat;
