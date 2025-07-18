import React from 'react';
import { Database, Search, FileText, Globe, Brain, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentEvent } from '@/lib/agentCallbacks';

interface AgentActionDisplayProps {
  events: AgentEvent[];
}

export default function AgentActionDisplay({ events }: AgentActionDisplayProps) {
  if (events.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 max-h-40 overflow-y-auto shadow-sm">
      <div className="text-xs font-medium text-blue-600 mb-2 flex items-center">
        <Brain className="h-3 w-3 mr-1" />
        AI Working... (Real-time Activity)
      </div>
      <div className="space-y-2">
        {events.map((event, index) => (
          <AgentEventItem key={index} event={event} />
        ))}
      </div>
    </div>
  );
}

function AgentEventItem({ event }: { event: AgentEvent }) {
  const getIcon = () => {
    switch (event.type) {
      case 'tool_start':
      case 'agent_action':
        if (event.name?.includes('search')) return <Search className="h-3 w-3 text-purple-500" />;
        if (event.name?.includes('db') || event.name?.includes('database') || event.name?.includes('knowledge')) return <Database className="h-3 w-3 text-blue-500" />;
        if (event.name?.includes('file')) return <FileText className="h-3 w-3 text-amber-500" />;
        if (event.name?.includes('web') || event.name?.includes('http')) return <Globe className="h-3 w-3 text-green-500" />;
        return <Brain className="h-3 w-3 text-indigo-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'thinking':
        return <Brain className="h-3 w-3 text-indigo-500" />;
      case 'tool_end':
        return <Database className="h-3 w-3 text-green-500" />;
      default:
        return <Brain className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (event.type) {
      case 'tool_start':
        return `Using ${event.name || 'tool'}`;
      case 'tool_end':
        return 'Tool completed';
      case 'agent_action':
        return `Using ${event.name || 'tool'}`;
      case 'agent_finish':
        return 'Completed task';
      case 'thinking':
        return 'Thinking...';
      case 'error':
        return 'Error';
      case 'text':
        return 'Processing';
      default:
        return event.type;
    }
  };

  const getContent = () => {
    if (!event.content) return null;
    
    // Truncate content if it's too long
    const maxLength = 100;
    const content = event.content.length > maxLength 
      ? `${event.content.substring(0, maxLength)}...` 
      : event.content;
      
    return content;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs flex items-start gap-2 py-1.5 px-2 bg-white rounded-md shadow-sm border border-blue-100 mb-1.5"
    >
      <div className="mt-0.5 text-gray-500">{getIcon()}</div>
      <div>
        <div className="font-medium text-gray-700">{getTitle()}</div>
        {getContent() && (
          <div className="text-gray-500 break-words">{getContent()}</div>
        )}
      </div>
    </motion.div>
  );
}