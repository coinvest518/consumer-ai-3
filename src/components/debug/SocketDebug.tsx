import { useSocket } from '@/hooks/useSocket';
import { useState } from 'react';

export default function SocketDebug() {
  const { isConnected, socketId, socket } = useSocket();
  const [testMessage, setTestMessage] = useState('');
  const [responses, setResponses] = useState<string[]>([]);

  const sendTestMessage = () => {
    if (testMessage.trim()) {
      console.log('[SocketDebug] Sending test message:', testMessage);
      socket.emit('test-message', { message: testMessage });
      setResponses(prev => [...prev, `Sent: ${testMessage}`]);
      setTestMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">Socket Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div>
          <strong>Socket ID:</strong> {socketId || 'None'}
        </div>
        
        <div>
          <strong>URL:</strong> {import.meta.env.VITE_SOCKET_URL || 'Default'}
        </div>
        
        <div className="flex gap-1">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Test message"
            className="flex-1 px-2 py-1 border rounded text-xs"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            disabled={!isConnected}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
          >
            Send
          </button>
        </div>
        
        {responses.length > 0 && (
          <div className="max-h-20 overflow-y-auto">
            {responses.slice(-3).map((response, i) => (
              <div key={i} className="text-xs text-gray-600">{response}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}