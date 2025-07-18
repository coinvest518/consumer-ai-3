import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  name: string;
  icon: LucideIcon;
  description: string;
  capabilities?: string[];
  usageCount?: number;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function AgentCard({
  name,
  icon: Icon,
  description,
  capabilities = [],
  usageCount = 0,
  onClick,
  isActive = false,
  className
}: AgentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all",
        isActive 
          ? "border-blue-500 bg-blue-50 shadow-md" 
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        className
      )}
      onClick={onClick}
    >
      {isActive && (
        <motion.div 
          className="absolute inset-0 bg-blue-500 opacity-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
        />
      )}
      
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          isActive ? "bg-blue-100" : "bg-gray-100"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            isActive ? "text-blue-600" : "text-gray-600"
          )} />
        </div>
        
        {usageCount > 0 && (
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Used {usageCount} times
          </span>
        )}
      </div>
      
      <div className="mt-3">
        <h3 className={cn(
          "font-medium",
          isActive ? "text-blue-700" : "text-gray-900"
        )}>
          {name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
      </div>
      
      {capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {capabilities.map((capability, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              {capability}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}