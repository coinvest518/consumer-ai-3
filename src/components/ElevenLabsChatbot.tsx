import { useEffect, useState } from 'react';

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
  const [open, setOpen] = useState(false); // persistent toggle by click
  const [hover, setHover] = useState(false); // transient on hover
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

  const visible = open || hover;

  return (
    <div
      className={className}
      // Wrapper sits fixed in the corner but doesn't block clicks when closed
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 9999,
        // When collapsed we allow pointer events to pass-through so underlying chat buttons remain clickable
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-hidden={visible ? 'false' : 'true'}
    >
      {/* Small toggle button is always interactive (pointerEvents auto) so user can open the widget without obstruction */}
      <button
        onClick={() => setOpen((s) => !s)}
        aria-pressed={open}
        aria-label={open ? 'Close voice assistant' : 'Open voice assistant'}
        title={open ? 'Close voice assistant' : 'Open voice assistant'}
        style={{
          pointerEvents: 'auto',
          width: 44,
          height: 44,
          borderRadius: 22,
          border: 'none',
          background: visible ? '#0b84ff' : 'rgba(11,132,255,0.12)',
          color: visible ? '#fff' : '#0b84ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(12,24,40,0.15)',
          transition: 'all 180ms ease',
          cursor: 'pointer',
        }}
      >
        {/* Simple microphone/sound icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 11C19 14.3137 16.3137 17 13 17H11C7.68629 17 5 14.3137 5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* The actual ElevenLabs element is only rendered (visible) when open/hover.
          We still mount it so the script is loaded, but we hide it visually when not needed.
      */}
      <div
        style={{
          marginTop: 10,
          width: visible ? 360 : 0,
          height: visible ? 520 : 0,
          overflow: 'hidden',
          transition: 'width 180ms ease, height 180ms ease, opacity 180ms ease',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          background: 'transparent',
          borderRadius: 12,
        }}
      >
        {visible && (
          <elevenlabs-convai
            agent-id="agent_8601k2329542ed4vs8zdwrz5gqga"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}