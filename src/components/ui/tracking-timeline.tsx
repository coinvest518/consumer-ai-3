import { CheckCircle, Circle, Clock, MapPin, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackingEvent {
  id: string;
  status: string;
  location?: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  className?: string;
}

export function TrackingTimeline({
  events,
  currentStatus,
  className
}: TrackingTimelineProps) {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusIcon = (event: TrackingEvent) => {
    if (event.isCompleted) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    
    if (event.isCurrent) {
      return <Clock className="h-6 w-6 text-blue-500" />;
    }
    
    // Different icons based on status
    if (event.status.toLowerCase().includes("delivered")) {
      return <CheckCircle className="h-6 w-6 text-gray-400" />;
    } else if (event.status.toLowerCase().includes("transit")) {
      return <Truck className="h-6 w-6 text-gray-400" />;
    } else if (event.status.toLowerCase().includes("arrived")) {
      return <MapPin className="h-6 w-6 text-gray-400" />;
    } else {
      return <Package className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Tracking Status</h3>
        <span className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          currentStatus.toLowerCase().includes("delivered") 
            ? "bg-green-100 text-green-800"
            : "bg-blue-100 text-blue-800"
        )}>
          {currentStatus}
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
                event.isCurrent ? "bg-white ring-2 ring-blue-500" : "bg-white"
              )}>
                {getStatusIcon(event)}
              </div>
              
              <div className="ml-10 space-y-1">
                <p className={cn(
                  "font-medium",
                  event.isCurrent ? "text-blue-600" : "text-gray-900"
                )}>
                  {event.status}
                </p>
                
                {event.location && (
                  <p className="text-sm text-gray-500">
                    {event.location}
                  </p>
                )}
                
                <p className="text-xs text-gray-400">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}