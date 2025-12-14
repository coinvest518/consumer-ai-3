import { useState, useEffect } from 'react';
import socket from '@/lib/socket';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState<string | null>(socket.id || null);

  useEffect(() => {
    const handleConnect = () => {
      console.log('[useSocket] Connected');
      setIsConnected(true);
      setSocketId(socket.id || null);
    };

    const handleDisconnect = () => {
      console.log('[useSocket] Disconnected');
      setIsConnected(false);
      setSocketId(null);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set initial state
    setIsConnected(socket.connected);
    setSocketId(socket.id || null);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return {
    isConnected,
    socketId,
    socket
  };
}