import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Search, Calendar, FileText, Scale, Mail, Package, 
  MessageSquare, BarChart3, Clock, RefreshCw, Menu, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentCard } from "@/components/ui/agent-card";
import { TrackingTimeline, TrackingEvent } from "@/components/ui/tracking-timeline";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api-client";

import ChatList from "../components/ChatList";
import TemplateSidebar from "../components/TemplateSidebar";
import TavusChatbot from "../components/TavusChatbot";
import { useChat } from "../hooks/useChat";
import { useToast } from "@/hooks/use-toast";

// Sample data for demonstration
// AI Agents
const aiAgents = [
  {
    id: "search",
    name: "Search Agent",
    icon: Search,
    description: "AI-powered search for consumer rights and laws.",
    capabilities: ["Web Search", "Legal Reasoning"],
    usageCount: 12
  },
  {
    id: "report",
    name: "Report Analysis",
    icon: FileText,
    description: "AI analyzes credit reports for errors and violations.",
    capabilities: ["Error Detection", "Legal Analysis"],
    usageCount: 3
  },
  {
    id: "letter",
    name: "Letter Generator",
    icon: FileText,
    description: "AI generates customized dispute letters for credit bureaus.",
    capabilities: ["Templates", "Customization"],
    usageCount: 7
  }
];

// Tools & Integrations
const integrations = [
  {
    id: "calendar",
    name: "Calendar Integration",
    icon: Calendar,
    description: "Set reminders for deadlines. This is a productivity tool, not an AI agent.",
    capabilities: ["Reminders", "Notifications"],
    usageCount: 5
  },
  {
    id: "legal",
    name: "Legal Database",
    icon: Scale,
    description: "Access legal information and resources. This is a reference tool, not an AI agent.",
    capabilities: ["FCRA", "FDCPA", "Case Law"],
    usageCount: 4
  },
  {
    id: "email",
    name: "Email Notifications",
    icon: Mail,
    description: "Send and receive notifications. This is an integration for reminders and updates.",
    capabilities: ["Scheduling", "Templates"],
    usageCount: 2
  },
  {
    id: "tracking",
    name: "Mail Tracking",
    icon: Package,
    description: "Track certified mail and get delivery updates. This is a mail integration, not an AI agent.",
    capabilities: ["USPS API", "Notifications"],
    usageCount: 6
  }
];

// Sample tracking data
const sampleTrackingEvents: TrackingEvent[] = [
  {
    id: "1",
    status: "Delivered",
    location: "Front Door/Porch",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isCompleted: true,
    isCurrent: false
  },
  {
    id: "2",
    status: "Out for Delivery",
    location: "Local Post Office",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    isCompleted: true,
    isCurrent: false
  },
  {
    id: "3",
    status: "Arrived at Post Office",
    location: "Regional Distribution Center",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isCompleted: true,
    isCurrent: false
  },
  {
    id: "4",
    status: "In Transit",
    location: "Distribution Center",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isCompleted: true,
    isCurrent: false
  },
  {
    id: "5",
    status: "Accepted",
    location: "Shipping Partner Facility",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    isCompleted: true,
    isCurrent: false
  }
];

export default function EnhancedDashboard() {
  // Auth and navigation
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    loadChatById,
    agentState,
  } = useChat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    dailyLimit: 5,
    chatsUsed: 0,
    remaining: 5,
    credits: 0
  });
  // Removed connectionStatus state
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Agent click
  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId === selectedAgent ? null : agentId);
    if (agentId === "chat") {
      navigate("/chat");
    }
  };



  // Sidebar
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleTemplateSelect = (template: any) => {
    navigate('/chat', { 
      state: { 
        template: template,
        templateContent: template.fullContent,
        templateType: template.type
      } 
    });
  };
  // Fetch user stats and credits from backend
  const refetchMetrics = async () => {
    try {
      if (!user) return;
      // Use the API client methods
      const [statsData, creditsData] = await Promise.all([
        api.getUserStats(user.id),
        api.getUserCredits(user.id)
      ]);
      
      setMetrics((prev) => ({
        ...prev,
        dailyLimit: statsData?.dailyLimit ?? prev.dailyLimit,
        chatsUsed: statsData?.chatsUsed ?? prev.chatsUsed,
        remaining: statsData?.remaining ?? prev.remaining,
        credits: creditsData?.credits ?? prev.credits
      }));
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  // Removed testChatConnection function

  // Loading and error states
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Sidebar */}
      <TemplateSidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onTemplateSelect={handleTemplateSelect}
        userCredits={metrics.remaining}
        onCreditUpdate={refetchMetrics}
      />

      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-96' : ''}`}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
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
                <Button onClick={() => navigate('/chat')}>New Chat</Button>
                <Button variant="outline" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await signOut(); navigate('/', { replace: true }); }}>Logout</Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paid Credits:</span>
                      <span className="font-medium">{metrics.credits}</span>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full mb-2"
                        onClick={() => { setIsUpgradeLoading(true); window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU'; setIsUpgradeLoading(false); }}
                        disabled={isUpgradeLoading}
                      >
                        {isUpgradeLoading ? 'Processing...' : 'Get 50 More Credits ($9.99)'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-md hover:from-purple-600 hover:to-blue-600"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-crypto-modal'))}
                      >
                        Buy Credits with Crypto
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
                      <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Agents Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">AI Agents</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {aiAgents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    name={agent.name}
                    icon={agent.icon}
                    description={agent.description}
                    capabilities={agent.capabilities}
                    usageCount={agent.usageCount}
                    onClick={() => handleAgentClick(agent.id)}
                    isActive={selectedAgent === agent.id}
                  />
                ))}
              </div>
            </section>

            {/* Tools & Integrations Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tools & Integrations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {integrations.map(tool => (
                  <AgentCard
                    key={tool.id}
                    name={tool.name}
                    icon={tool.icon}
                    description={tool.description}
                    capabilities={tool.capabilities}
                    usageCount={tool.usageCount}
                    onClick={() => handleAgentClick(tool.id)}
                    isActive={selectedAgent === tool.id}
                  />
                ))}
              </div>
            </section>

            {/* Tracking Section */}
            <div className="grid grid-cols-1 gap-8">
              {/* Tracking Section */}
              <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Recent Tracking</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <Package className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                <TrackingTimeline
                  events={sampleTrackingEvents}
                  currentStatus="Delivered"
                />
              </section>
            </div>

            {/* Recent Chats */}
            <h2 className="text-2xl font-bold mb-4 mt-10">Recent Chats</h2>
            {messages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <p className="text-gray-500 mb-4">You haven't started any chats yet</p>
                  <Button onClick={() => navigate('/chat')}>Start Your First Chat</Button>
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
}