import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Calendar, FileText, Scale, Mail, Package, Upload, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

interface ToolPanelProps {
  expanded: boolean;
  onToggle: () => void;
  tools: Tool[];
  onSelectTool: (toolId: string) => void;
  selectedTool?: string | null;
  className?: string;
}

export function ToolPanel({
  expanded,
  onToggle,
  tools,
  onSelectTool,
  selectedTool,
  className
}: ToolPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTools = searchQuery
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tools;

  return (
    <motion.div
      initial={{ width: expanded ? 300 : 60 }}
      animate={{ width: expanded ? 300 : 60 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "h-full border-r bg-gray-50 flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between p-3 border-b">
        {expanded ? (
          <h3 className="font-medium text-gray-900">AI Tools</h3>
        ) : (
          <Bot className="h-5 w-5 text-gray-500 mx-auto" />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1"
        >
          {expanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          "space-y-1 p-2",
          !expanded && "flex flex-col items-center"
        )}>
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            
            return (
              <button
                key={tool.id}
                className={cn(
                  "w-full text-left transition-colors",
                  expanded 
                    ? "flex items-center gap-3 px-3 py-2 rounded-md" 
                    : "p-2 rounded-full",
                  isSelected
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                )}
                onClick={() => onSelectTool(tool.id)}
              >
                <Icon className={cn(
                  "flex-shrink-0",
                  expanded ? "h-5 w-5" : "h-5 w-5",
                  isSelected ? "text-blue-600" : "text-gray-500"
                )} />
                
                {expanded && (
                  <div>
                    <div className="font-medium text-sm">
                      {tool.name}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {tool.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {expanded && (
        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onSelectTool("upload")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// Default tools
export const defaultTools: Tool[] = [
  {
    id: "search",
    name: "Search Agent",
    icon: Search,
    description: "Search for consumer law information"
  },
  {
    id: "calendar",
    name: "Calendar Agent",
    icon: Calendar,
    description: "Set reminders for important dates"
  },
  {
    id: "report",
    name: "Report Analysis",
    icon: FileText,
    description: "Analyze credit reports for errors"
  },
  {
    id: "letter",
    name: "Letter Generator",
    icon: FileText,
    description: "Create dispute letters"
  },
  {
    id: "legal",
    name: "Legal Database",
    icon: Scale,
    description: "Access legal information"
  },
  {
    id: "email",
    name: "Email Notifications",
    icon: Mail,
    description: "Send email notifications"
  },
  {
    id: "tracking",
    name: "Mail Tracking",
    icon: Package,
    description: "Track certified mail"
  }
];