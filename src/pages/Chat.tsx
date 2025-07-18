import { motion } from "framer-motion";
import ChatInterface from "@/components/chat/ChatInterface";
import { useState, useEffect } from "react";
import { Brain, MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
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
      className="min-h-screen flex flex-col bg-gray-50"
    >
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

      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Ask ConsumerAI
              </h2>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-500" />
              <p className="text-lg text-gray-500">
                Get answers to your consumer law questions instantly.
              </p>
            </div>
            {initialTemplate && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{initialTemplate.name}</strong> template is ready to use
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {initialTemplate.description}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
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
};

export default Chat;
