import { useState, useEffect } from "react";
import { Bot, Search, Calendar, FileText, Scale, Sparkles, Mail, Package } from "lucide-react";
import { motion } from "framer-motion";

interface AgentIndicatorProps {
  content: string;
}

export default function AgentIndicator({ content }: AgentIndicatorProps) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [toolUsed, setToolUsed] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if the message contains tool usage indicators
    const toolMatch = content.match(/\[Tool:\s*([^\]]+)\]/i);
    
    if (toolMatch) {
      const tool = toolMatch[1].trim().toLowerCase();
      setToolUsed(tool);
      
      // Determine which agent is active based on the tool
      if (tool.includes('search') || tool === 'web_search' || tool === 'tavily_search') {
        setActiveAgent('search');
      } else if (tool === 'set_reminder' || tool.includes('calendar')) {
        setActiveAgent('calendar');
      } else if (tool === 'analyze_credit_report' || tool.includes('report')) {
        setActiveAgent('report');
      } else if (tool === 'generate_dispute_letter' || tool.includes('letter')) {
        setActiveAgent('letter');
      } else if (tool === 'search_legal_database' || tool.includes('legal')) {
        setActiveAgent('legal');
      } else if (tool === 'send_email_notification' || tool.includes('email')) {
        setActiveAgent('email');
      } else if (tool === 'track_certified_mail' || tool === 'register_tracking_notifications' || tool.includes('tracking') || tool.includes('certified')) {
        setActiveAgent('tracking');
      } else {
        setActiveAgent('supervisor');
      }
    } else {
      setToolUsed(null);
      setActiveAgent(null);
    }
  }, [content]);
  
  if (!activeAgent) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2 flex items-center gap-2 text-xs font-medium"
    >
      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
        {activeAgent === 'search' && <Search className="h-3 w-3" />}
        {activeAgent === 'calendar' && <Calendar className="h-3 w-3" />}
        {activeAgent === 'report' && <FileText className="h-3 w-3" />}
        {activeAgent === 'letter' && <FileText className="h-3 w-3" />}
        {activeAgent === 'legal' && <Scale className="h-3 w-3" />}
        {activeAgent === 'email' && <Mail className="h-3 w-3" />}
        {activeAgent === 'tracking' && <Package className="h-3 w-3" />}
        {activeAgent === 'supervisor' && <Bot className="h-3 w-3" />}
        
        <span>
          {activeAgent === 'search' && 'Search Agent'}
          {activeAgent === 'calendar' && 'Calendar Agent'}
          {activeAgent === 'report' && 'Report Analysis Agent'}
          {activeAgent === 'letter' && 'Letter Generator Agent'}
          {activeAgent === 'legal' && 'Legal Database Agent'}
          {activeAgent === 'email' && 'Email Notification Agent'}
          {activeAgent === 'tracking' && 'Certified Mail Tracking Agent'}
          {activeAgent === 'supervisor' && 'Supervisor Agent'}
        </span>
      </div>
      
      {toolUsed && (
        <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
          <Sparkles className="h-3 w-3" />
          <span>Used {toolUsed}</span>
        </div>
      )}
    </motion.div>
  );
}