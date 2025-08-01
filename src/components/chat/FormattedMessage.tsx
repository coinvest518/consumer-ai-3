import { cn } from "@/lib/utils";
import { ExternalLink, Scale } from "lucide-react";

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

  // Parse legal citations and references
  const parseLegalContent = (content: string) => {
    const patterns = {
      usc: /(\d+\s+U\.S\.C\.\s+§\s+\d+[a-z]*(?:\([a-z0-9]+\))*)/gi,
      cfr: /(\d+\s+C\.F\.R\.\s+§\s+\d+\.\d+)/gi,
      legalRef: /Legal Reference:\s*([^\n]+)/gi,
      statute: /(FDCPA|FCRA|TCPA|CCPA)\s+Section\s+\d+[a-z]*(?:\([a-z0-9]+\))*/gi
    };

    let parsedContent = content;
    const citations: Array<{type: string, text: string, url: string}> = [];

    // Parse USC citations
    parsedContent = parsedContent.replace(patterns.usc, (match) => {
      const cleanMatch = match.replace(/\s+/g, ' ').trim();
      const url = `https://www.law.cornell.edu/uscode/text/${cleanMatch.replace(/\s+/g, '').replace('U.S.C.§', '/')}`;
      citations.push({type: 'USC', text: cleanMatch, url});
      return `<cite data-type="usc" data-url="${url}">${cleanMatch}</cite>`;
    });

    // Parse Legal References
    parsedContent = parsedContent.replace(patterns.legalRef, (match, ref) => {
      return `<legal-ref>${ref.trim()}</legal-ref>`;
    });

    return { parsedContent, citations };
  };

  const { parsedContent, citations } = parseLegalContent(content);

  // Format the content with special handling for tool usage and legal citations
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
          formattedParts.push(formatBoldText(parts[i]).join(''));
        } else if (i % 3 === 1) {
          // This is a tool type (Tool or Action)
          const toolType = parts[i];
          const toolName = parts[i + 1];
          
          // Add the tool usage indicator
          formattedParts.push(
            `<div class="my-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center gap-2 text-xs text-blue-700 font-medium mb-1">
                <span class="bg-blue-100 px-2 py-0.5 rounded">${toolType}</span>
                <span>${toolName}</span>
              </div>
            </div>`
          );
          
          // Skip the next part since we've already used it
          i++;
        }
      }
      
      return formattedParts.join('');
    } else {
      // If no tool usage, just format bold text
      return formatBoldText(text).join('');
    }
  };
  
  // Helper function to format bold text
  const formatBoldText = (text: string) => {
    // Split by markdown bold markers
    const parts = text.split(/\*\*(.*?)\*\*/g);
    
    return parts.map((part, index) => {
      // Every odd index is bold text
      if (index % 2 === 1) {
        return `<strong class="${isAI ? 'text-blue-700' : 'text-blue-100'} font-semibold">${part}</strong>`;
      }
      return part;
    });
  };
  
  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          isAI ? "text-gray-800" : "text-white"
        )}
        dangerouslySetInnerHTML={{
          __html: typeof formatContent(parsedContent) === 'string' 
            ? formatContent(parsedContent)
                .replace(/<cite data-type="usc" data-url="([^"]+)">([^<]+)<\/cite>/g, 
                  '<a href="$1" target="_blank" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium border-b border-blue-300 hover:border-blue-500 transition-colors">$2 <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path></svg></a>')
                .replace(/<legal-ref>([^<]+)<\/legal-ref>/g, 
                  '<div class="bg-blue-50 border-l-4 border-blue-400 p-3 my-2 rounded-r-lg"><div class="flex items-center gap-2 text-blue-800 font-medium text-sm"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"></path></svg>Legal Reference:</div><div class="text-blue-700 mt-1">$1</div></div>')
            : parsedContent
        }}
      />
      
      {/* Legal Citations Panel */}
      {isAI && citations.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Scale className="w-4 h-4" />
            Legal Citations
          </div>
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="font-mono">{citation.text}</span>
                <span className="text-xs text-gray-500">({citation.type})</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 