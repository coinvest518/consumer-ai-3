import { Button } from "./button";

interface ChatBubbleUserProps {
  content: string;
}

interface ChatBubbleAIProps {
  content: string;
  citation?: string;
  actions?: string[];
}

export function ChatBubbleUser({ content }: ChatBubbleUserProps) {
  return (
    <div className="bg-primary p-3 rounded-lg chat-bubble-user shadow-sm text-white max-w-[80%]">
      <p className="text-sm">{content}</p>
    </div>
  );
}

export function ChatBubbleAI({ content, citation, actions }: ChatBubbleAIProps) {
  const renderStructuredContent = (text: string) => {
    if (!text) return null;

    // Normalize line endings
    const normalized = text.replace(/\r\n/g, "\n");

    // Split into blocks by double newlines
    const blocks = normalized.split(/\n\s*\n/);

    return blocks.map((block, idx) => {
      const lines = block.split(/\n/).map((l) => l.trim());

      // List block (lines starting with - or *)
      if (lines.every((l) => /^(-|\*)\s+/.test(l))) {
        return (
          <ul key={idx} className="list-disc list-inside mt-2">
            {lines.map((l, i) => (
              <li key={i} className="text-sm text-gray-800">{l.replace(/^(-|\*)\s+/, '')}</li>
            ))}
          </ul>
        );
      }

      // Key: Value lines -> render as definition list
      if (lines.every((l) => /:\s/.test(l))) {
        return (
          <dl key={idx} className="mt-2 grid grid-cols-1 gap-1">
            {lines.map((l, i) => {
              const parts = l.split(/:\s(.+)/);
              return (
                <div key={i} className="flex justify-between gap-4">
                  <dt className="text-xs text-gray-500">{parts[0]}</dt>
                  <dd className="text-sm text-gray-800 text-right">{parts[1] ?? ''}</dd>
                </div>
              );
            })}
          </dl>
        );
      }

      // Heading-like block (all caps and short)
      if (block.trim().length < 60 && /^[A-Z0-9 \-\/]+$/.test(block.trim())) {
        return (
          <h3 key={idx} className="text-sm font-semibold mt-3 text-gray-800">{block}</h3>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="text-sm text-gray-800 mt-2 leading-relaxed">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg chat-bubble-ai shadow-sm max-w-[80%]">
      <div className="ai-document prose max-w-none">{renderStructuredContent(content)}</div>
      
      {citation && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-primary">
          <p className="font-semibold">Legal Reference:</p>
          <p className="whitespace-pre-wrap">{citation}</p>
        </div>
      )}
      
      {actions && actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200"
            >
              {action}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
