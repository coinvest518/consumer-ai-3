import { CheckCircle, Circle, Clock, Mail, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CertifiedMailEvent {
  id: string;
  type: 'mailed' | 'delivered' | 'deadline' | 'overdue';
  description: string;
  date: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isUrgent?: boolean;
}

interface CertifiedMailTimelineProps {
  events: CertifiedMailEvent[];
  mailDescription: string;
  className?: string;
}

export function CertifiedMailTimeline({
  events,
  mailDescription,
  className
}: CertifiedMailTimelineProps) {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getEventIcon = (event: CertifiedMailEvent) => {
    if (event.isCompleted) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    
    if (event.isUrgent) {
      return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
    
    if (event.isCurrent) {
      return <Clock className="h-6 w-6 text-blue-500" />;
    }
    
    // Different icons based on event type
    switch (event.type) {
      case 'mailed':
        return <Mail className="h-6 w-6 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-gray-400" />;
      case 'deadline':
        return <Calendar className="h-6 w-6 text-gray-400" />;
      case 'overdue':
        return <AlertTriangle className="h-6 w-6 text-gray-400" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const hasUrgentEvents = events.some(e => e.isUrgent);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Mail Timeline</h3>
        <span className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          hasUrgentEvents
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
        )}>
          {mailDescription}
        </span>
      </div>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start">
              <div className={cn(
                "absolute left-0 mt-1 flex h-7 w-7 items-center justify-center rounded-full",
                event.isCurrent ? "bg-white ring-2 ring-blue-500" : 
                event.isUrgent ? "bg-white ring-2 ring-red-500" : "bg-white"
              )}>
                {getEventIcon(event)}
              </div>
              
              <div className="ml-10 space-y-1">
                <p className={cn(
                  "font-medium",
                  event.isUrgent ? "text-red-600" :
                  event.isCurrent ? "text-blue-600" : "text-gray-900"
                )}>
                  {event.description}
                </p>
                
                <p className="text-xs text-gray-400">
                  {new Date(event.date).toLocaleDateString()}
                  {event.type === 'deadline' && (
                    <span className="ml-2 text-red-600 font-medium">
                      (Legal Deadline)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}