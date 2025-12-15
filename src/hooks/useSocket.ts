import { useState, useEffect } from 'react';
import socket from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';

export function useSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState<string | null>(socket.id || null);

  useEffect(() => {
    const handleConnect = () => {
      console.log('[useSocket] Connected');
      setIsConnected(true);
      setSocketId(socket.id || null);

      // Authenticate user when socket connects
      if (user?.id) {
        console.log('[useSocket] Authenticating user:', user.id);
        socket.emit('authenticate', { userId: user.id });
      }
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

    // If already connected and user exists, authenticate
    if (socket.connected && user?.id) {
      console.log('[useSocket] Socket already connected, authenticating user:', user.id);
      socket.emit('authenticate', { userId: user.id });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [user?.id]);

  return {
    isConnected,
    socketId,
    socket
  };
}