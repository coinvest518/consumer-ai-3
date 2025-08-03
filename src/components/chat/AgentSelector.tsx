import { useState } from "react";
import { Bot, Search, Calendar, FileText, Scale, X, Mail, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentSelectorProps {
  onSelect: (agent: string | null) => void;
  selectedAgent: string | null;
}

export default function AgentSelector({ onSelect, selectedAgent }: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const agents = [
    { id: "search", name: "Search Agent", icon: Search, description: "Search for consumer law information" },
    { id: "calendar", name: "Calendar Agent", icon: Calendar, description: "Set reminders for important dates" },
    { id: "report", name: "Report Agent", icon: FileText, description: "Analyze credit reports" },
    { id: "letter", name: "Letter Agent", icon: FileText, description: "Generate dispute letters" },
    { id: "legal", name: "Legal Agent", icon: Scale, description: "Access legal database" },
    { id: "email", name: "Email Agent", icon: Mail, description: "Send email notifications" },
    { id: "tracking", name: "Tracking Agent", icon: Package, description: "Track certified mail" }
  ];
  
  const handleSelect = (agentId: string) => {
    onSelect(agentId === selectedAgent ? null : agentId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation",
          selectedAgent ? "bg-blue-50 text-blue-700 border-blue-200" : ""
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {selectedAgent ? (
          <>
            <span className="truncate max-w-[120px] sm:max-w-none">
              {agents.find(a => a.id === selectedAgent)?.name || "AI Agent"}
            </span>
            <X 
              className="h-3 w-3 ml-1 cursor-pointer touch-manipulation" 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }} 
            />
          </>
        ) : (
          <span>Use AI Agent</span>
        )}
      </Button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 max-h-80 overflow-y-auto"
        >
          <div className="text-xs font-medium text-gray-500 mb-2 px-2">Select an agent</div>
          {agents.map((agent) => (
            <button
              key={agent.id}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-md text-left text-sm touch-manipulation",
                selectedAgent === agent.id
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 active:bg-gray-100"
              )}
              onClick={() => handleSelect(agent.id)}
            >
              <agent.icon className="h-4 w-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{agent.name}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{agent.description}</div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}