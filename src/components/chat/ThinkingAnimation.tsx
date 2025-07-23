import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { ChatProgress } from "@/hooks/useChat";

interface ThinkingAnimationProps {
  progress: ChatProgress;
}

export default function ThinkingAnimation({ progress }: ThinkingAnimationProps) {
  const progressPercentage = ((progress.current + 1) / progress.steps.length) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-3 sm:p-4 w-full max-w-xs sm:max-w-md mx-auto text-sm"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Brain className="h-6 w-6 text-blue-600" />
        </motion.div>
        <div>
          <h4 className="font-medium text-gray-800 text-sm sm:text-base">AI is thinking...</h4>
          <p className="text-xs text-gray-500">{progress.steps[progress.current]}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {progress.current + 1}/{progress.steps.length}
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="flex justify-between text-[11px] sm:text-xs text-gray-400">
        <span>Processing</span>
        <span>Analyzing</span>
        <span>Responding</span>
      </div>
    </motion.div>
  );
}