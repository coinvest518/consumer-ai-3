import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Calendar, FileText, Scale, Mail, Package, Bot } from "lucide-react";
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
      initial={{ width: expanded ? 300 : 56 }}
      animate={{ width: expanded ? 300 : 56 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "h-14 md:h-full border-t md:border-t-0 md:border-r bg-gray-50 flex md:flex-col flex-row md:static fixed bottom-0 left-0 right-0 z-20 md:z-auto",
        className
      )}
    >
      <div className="flex items-center justify-between p-2 md:p-3 border-b md:border-b-0 border-r-0 md:border-r">
        {expanded ? (
          <h3 className="font-medium text-gray-900 text-sm">AI Tools</h3>
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
        <div className="p-2 md:p-3 border-b md:border-b-0">
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
      
      <div className={cn(
        "flex-1 overflow-y-auto md:overflow-y-visible flex flex-row md:flex-col items-center md:items-stretch justify-center md:justify-start",
        expanded ? "" : ""
      )}>
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              className={cn(
                expanded
                  ? "w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-md text-left text-xs md:text-sm"
                  : "p-2 rounded-full mx-1 md:mx-0",
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
                  <div className="font-medium text-xs md:text-sm">
                    {tool.name}
                  </div>
                  <div className="text-[11px] md:text-xs text-gray-500 line-clamp-1">
                    {tool.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

    </motion.div>
  );
}

// Default prompts for consumer finance questions
export const defaultPrompts: string[] = [
  "How can I fix late payments on my credit report?",
  "What should I do if I see errors on my credit report?",
  "How to dispute inaccurate information with credit bureaus?",
  "What are my rights under the Fair Credit Reporting Act?",
  "How to improve my credit score quickly?",
  "What to do if I'm being contacted by debt collectors?",
  "How to remove old negative items from my credit report?",
  "What are the best ways to build credit?",
  "How to handle identity theft affecting my credit?",
  "What should I know about credit card debt settlement?"
];