import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Search, Calendar, FileText, Scale, Mail, Package, 
  MessageSquare, BarChart3, Upload, Clock, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/ui/agent-card";
import { TrackingTimeline, TrackingEvent } from "@/components/ui/tracking-timeline";
import { FileUploadZone } from "@/components/ui/file-upload";
import { useAuth } from "@/hooks/useAuth";

// Sample data for demonstration
const sampleAgents = [
  {
    id: "search",
    name: "Search Agent",
    icon: Search,
    description: "Find information about consumer rights and laws",
    capabilities: ["Web Search", "Legal Database"],
    usageCount: 12
  },
  {
    id: "calendar",
    name: "Calendar Agent",
    icon: Calendar,
    description: "Set reminders for important deadlines",
    capabilities: ["Reminders", "Notifications"],
    usageCount: 5
  },
  {
    id: "report",
    name: "Report Analysis",
    icon: FileText,
    description: "Analyze credit reports for errors and violations",
    capabilities: ["Error Detection", "Legal Analysis"],
    usageCount: 3
  },
  {
    id: "letter",
    name: "Letter Generator",
    icon: FileText,
    description: "Create customized dispute letters for credit bureaus",
    capabilities: ["Templates", "Customization"],
    usageCount: 7
  },
  {
    id: "legal",
    name: "Legal Database",
    icon: Scale,
    description: "Access legal information about consumer protection",
    capabilities: ["FCRA", "FDCPA", "Case Law"],
    usageCount: 4
  },
  {
    id: "email",
    name: "Email Notifications",
    icon: Mail,
    description: "Send email notifications and reminders",
    capabilities: ["Scheduling", "Templates"],
    usageCount: 2
  },
  {
    id: "tracking",
    name: "Mail Tracking",
    icon: Package,
    description: "Track certified mail and get delivery updates",
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId === selectedAgent ? null : agentId);
    
    // In a real implementation, you might navigate to a specific page or open a modal
    if (agentId === "chat") {
      navigate("/chat");
    }
  };
  
  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // In a real implementation, you would upload the files to a server
    // and then navigate to the chat page or show a success message
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-12"
    >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.email || "User"}</p>
            </div>
            <Button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Start Chatting
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Chat Activity</h3>
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-2">24</p>
            <p className="text-sm text-gray-500 mt-1">Total conversations</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Agent Usage</h3>
              <Bot className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mt-2">7</p>
            <p className="text-sm text-gray-500 mt-1">Different agents used</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-2">3</p>
            <p className="text-sm text-gray-500 mt-1">Documents analyzed</p>
          </div>
        </div>
        
        {/* AI Agents Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">AI Agents</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sampleAgents.map(agent => (
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
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Upload Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Upload Documents</h2>
              <Upload className="h-5 w-5 text-gray-400" />
            </div>
            
            <FileUploadZone
              acceptedFileTypes={['application/pdf', 'image/*']}
              maxFileSize={10 * 1024 * 1024} // 10MB
              onUpload={handleFileUpload}
              showPreview={true}
            />
          </section>
          
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
      </main>
    </motion.div>
  );
}