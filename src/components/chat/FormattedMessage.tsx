import { cn } from "@/lib/utils";

interface FormattedMessageProps {
  content: string;
  isAI?: boolean;
}

export const FormattedMessage = ({ content, isAI = false }: FormattedMessageProps) => {
  // Add safety check for undefined/null content
  if (!content || typeof content !== 'string') {
    console.warn('FormattedMessage received invalid content:', content);
    return (
      <div className={cn(
        "text-sm leading-relaxed text-gray-500 italic",
        isAI ? "text-gray-500" : "text-gray-400"
      )}>
        {content === null ? 'Loading message...' : 'No content available'}
      </div>
    );
  }

  // Check if the content contains tool usage indicators
  const hasToolUsage = content.includes('[Tool:') || content.includes('[Action:');

  // Format the content with special handling for tool usage
  const formatContent = (text: string) => {
    // First handle tool usage sections if present
    if (hasToolUsage) {
      // Split the content by tool usage markers
      const toolRegex = /\[(Tool|Action):\s*([^\]]+)\]/g;
      const parts = text.split(toolRegex);
      
      // Process the parts
      const formattedParts = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 3 === 0) {
          // Regular text part
          formattedParts.push(formatBoldText(parts[i]));
        } else if (i % 3 === 1) {
          // This is a tool type (Tool or Action)
          const toolType = parts[i];
          const toolName = parts[i + 1];
          
          // Add the tool usage indicator
          formattedParts.push(
            <div key={`tool-${i}`} className="my-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium mb-1">
                <span className="bg-blue-100 px-2 py-0.5 rounded">{toolType}</span>
                <span>{toolName}</span>
              </div>
            </div>
          );
          
          // Skip the next part since we've already used it
          i++;
        }
      }
      
      return formattedParts;
    } else {
      // If no tool usage, just format bold text
      return formatBoldText(text);
    }
  };
  
  // Helper function to format bold text
  const formatBoldText = (text: string) => {
    // Split by markdown bold markers
    const parts = text.split(/\*\*(.*?)\*\*/g);
    
    return parts.map((part, index) => {
      // Every odd index is bold text
      if (index % 2 === 1) {
        return (
          <span 
            key={index} 
            className={cn(
              "font-semibold",
              isAI ? "text-blue-700" : "text-blue-100"
            )}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  return (
    <div className={cn(
      "text-sm leading-relaxed whitespace-pre-wrap",
      isAI ? "text-gray-800" : "text-white"
    )}>
      {formatContent(content)}
    </div>
  );
}; 