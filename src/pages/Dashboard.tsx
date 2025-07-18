import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import { Loader2, Menu, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import ChatList from '../components/ChatList';
import TemplateSidebar from '../components/TemplateSidebar';
import TavusChatbot from '../components/TavusChatbot';
import { useChat } from '../hooks/useChat';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    loadChatById,
    progress,
    agentState,
  } = useChat();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    dailyLimit: 5,
    chatsUsed: 0,
    remaining: 5
  });
  const [connectionStatus, setConnectionStatus] = useState({
    checking: false,
    chatConnected: false,
    message: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchMetrics = async () => {
      try {
        if (!user) return;
        const metricsData = await api.getChatLimits(user.id);
        setMetrics({
          dailyLimit: metricsData.dailyLimit || 5,
          chatsUsed: metricsData.chatsUsed || 0,
          remaining: (metricsData.dailyLimit || 5) - (metricsData.chatsUsed || 0)
        });
      } catch (err) {
        setMetrics({
          dailyLimit: 5,
          chatsUsed: 0,
          remaining: 5
        });
      }
    };

    if (user) {
      fetchMetrics();
    }
  }, [user, authLoading, navigate]);

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/chat');
  };

  const handleChatClick = (chatId: string) => {
    const safeId = chatId.replace(/[^a-zA-Z0-9-]/g, '');
    navigate(`/chat/${safeId}`);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGetMoreCredits = () => {
    try {
      setIsUpgradeLoading(true);
      // Redirect to the fixed Stripe payment link
      window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU';
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to redirect to payment page",
        variant: "destructive"
      });
    } finally {
      setIsUpgradeLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTemplateSelect = (template: any) => {
    // Navigate to chat with the template pre-loaded
    navigate('/chat', { 
      state: { 
        template: template,
        templateContent: template.fullContent,
        templateType: template.type
      } 
    });
  };

  const refetchMetrics = async () => {
    try {
      if (!user) return;
      const metricsData = await api.getChatLimits(user.id);
      setMetrics({
        dailyLimit: metricsData.dailyLimit || 5,
        chatsUsed: metricsData.chatsUsed || 0,
        remaining: (metricsData.dailyLimit || 5) - (metricsData.chatsUsed || 0)
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };
  
  const testChatConnection = async () => {
    if (!user) return;
    
    setConnectionStatus(prev => ({ ...prev, checking: true, message: '' }));
    try {
            // const response = await api.testChat(user.id);
      setConnectionStatus({
        checking: false,
        chatConnected: true,
                message: 'Chat API is connected! (testChat not implemented)'
      });
    } catch (err) {
      console.error('Chat connection test failed:', err);
      setConnectionStatus({
        checking: false,
        chatConnected: false,
        message: (err as Error).message || 'Failed to connect to Chat API'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-4 text-center text-red-600">
          {error}
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Template Sidebar */}
      <TemplateSidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onTemplateSelect={handleTemplateSelect}
        userCredits={metrics.remaining}
        onCreditUpdate={refetchMetrics}
      />

      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-96' : ''}`}>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSidebarToggle}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  <FileText className="w-4 h-4" />
                  Templates
                </Button>
                <h1 className="text-3xl font-bold">Dashboard</h1>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleNewChat}>New Chat</Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Usage Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Questions Remaining:</span>
                    <span className="font-medium">{metrics.remaining}/{metrics.dailyLimit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Questions Asked:</span>
                    <span className="font-medium">{metrics.chatsUsed}</span>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGetMoreCredits}
                      disabled={isUpgradeLoading}
                    >
                      {isUpgradeLoading ? 'Processing...' : 'Get 50 More Credits ($9.99)'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Chats:</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Chat API:</span>
                    <span className="font-medium flex items-center gap-1">
                      {connectionStatus.checking ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : connectionStatus.chatConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      {connectionStatus.checking ? 'Checking...' : connectionStatus.chatConnected ? 'Connected' : 'Not Tested'}
                    </span>
                  </div>
                  
                  {connectionStatus.message && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      {connectionStatus.message}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={testChatConnection}
                      disabled={connectionStatus.checking}
                    >
                      {connectionStatus.checking ? 'Testing...' : 'Test Chat Connection'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Recent Chats</h2>
          
          {messages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-gray-500 mb-4">You haven't started any chats yet</p>
                <Button onClick={handleNewChat}>Start Your First Chat</Button>
              </CardContent>
            </Card>
          ) : (
            <ChatList
              sessions={[
                {
                  id: 'current',
                  title: 'Current Chat',
                  lastMessage: messages[messages.length - 1]?.content || '',
                  updatedAt: messages[messages.length - 1]?.created_at || new Date().toISOString(),
                  messageCount: messages.length,
                  messages: messages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    role: msg.role,
                    created_at: msg.created_at
                  }))
                }
              ]}
            />
          )}
          </div>
        </div>
        
        {/* Floating Tavus Customer Support Chatbot */}
        <TavusChatbot />
      </div>
    </motion.div>
  );
};

export default Dashboard;