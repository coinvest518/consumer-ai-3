import { useEffect } from 'react';

interface ElevenLabsChatbotProps {
  className?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string;
        style?: React.CSSProperties;
      };
    }
  }
}

export default function ElevenLabsChatbot({ className = '' }: ElevenLabsChatbotProps) {
  // Load ElevenLabs script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <elevenlabs-convai 
      agent-id="agent_8601k2329542ed4vs8zdwrz5gqga"
    />
  );
}