import { useEffect, useState } from 'react';

interface ElevenLabsChatbotProps {
  className?: string;
}

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string;
        style?: React.CSSProperties;
      };
    }
  }
}

export default function ElevenLabsChatbot({ className = '' }: ElevenLabsChatbotProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [minimized, setMinimized] = useState(false);
  
  // Load ElevenLabs script only once
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="elevenlabs/convai-widget-embed"]');
    if (existingScript) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    document.head.appendChild(script);
  }, []);

  // Hide tooltip after 5 seconds or when widget is opened
  useEffect(() => {
    if (open) {
      setShowTooltip(false);
      return;
    }
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, [open]);

  // Auto-minimize after 10 seconds of inactivity
  useEffect(() => {
    if (!open && !hover) {
      const timer = setTimeout(() => setMinimized(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setMinimized(false);
    }
  }, [open, hover]);

  const visible = open || hover;

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        left: 20,
        bottom: 20,
        zIndex: 9999,
        pointerEvents: visible ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-hidden={visible ? 'false' : 'true'}
    >
      {/* Tooltip / Label */}
      {!visible && !minimized && (
        <div
          style={{
            pointerEvents: 'auto',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: showTooltip ? 'pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {/* Arrow pointing to button */}
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '8px solid #764ba2',
            }}
          />
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🎙️</span>
            <span>Chat with AI Assistant</span>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => {
          setOpen((s) => !s);
          setMinimized(false);
        }}
        aria-pressed={open}
        aria-label={open ? 'Close voice assistant' : 'Open voice assistant'}
        title={open ? 'Close voice assistant' : 'Chat with AI Assistant'}
        style={{
          pointerEvents: 'auto',
          width: minimized ? 40 : 56,
          height: minimized ? 40 : 56,
          borderRadius: minimized ? 20 : 28,
          border: 'none',
          background: visible 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: visible 
            ? '0 8px 25px rgba(102, 126, 234, 0.5)' 
            : '0 6px 20px rgba(102, 126, 234, 0.4)',
          transition: 'all 200ms ease',
          cursor: 'pointer',
          transform: visible ? 'scale(1.05)' : minimized ? 'scale(0.85)' : 'scale(1)',
          opacity: minimized ? 0.7 : 1,
        }}
      >
        {minimized ? (
          /* Small microphone icon for minimized state */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" fill="currentColor"/>
            <path d="M19 11C19 14.866 15.866 18 12 18M12 18C8.13401 18 5 14.866 5 11M12 18V22M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : visible ? (
          /* X close icon */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          /* Microphone icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" fill="currentColor"/>
            <path d="M19 11C19 14.866 15.866 18 12 18M12 18C8.13401 18 5 14.866 5 11M12 18V22M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* ElevenLabs widget container */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 0,
          width: visible ? 380 : 0,
          height: visible ? 550 : 0,
          overflow: 'hidden',
          transition: 'width 200ms ease, height 200ms ease, opacity 200ms ease',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          background: 'transparent',
          borderRadius: 16,
          boxShadow: visible ? '0 10px 40px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {visible && (
          <elevenlabs-convai
            agent-id="agent_8601k2329542ed4vs8zdwrz5gqga"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(0); }
          50% { opacity: 0.8; transform: translateX(-3px); }
        }
      `}</style>
    </div>
  );
}