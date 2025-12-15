import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://consumer-ai-render.onrender.com";

console.log('[Socket] Connecting to:', SOCKET_URL);

const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
  forceNew: false
});

// Connection event handlers
socket.on('connect', () => {
  console.log('[Socket] Connected with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('[Socket] Reconnection error:', error);
});

// Function to authenticate socket with user ID
export function authenticateSocket(userId: string) {
  if (socket.connected) {
    console.log('[Socket] Authenticating with user ID:', userId);
    socket.emit('authenticate', { userId });
  } else {
    // Wait for connection and then authenticate
    socket.once('connect', () => {
      console.log('[Socket] Authenticating with user ID:', userId);
      socket.emit('authenticate', { userId });
    });
  }
}

// Upload progress event handlers
socket.on('upload-registered', (data) => {
  console.log('[Socket] File accepted for processing:', data);
});

socket.on('analysis-started', (data) => {
  console.log('[Socket] Analysis in progress:', data.message);
});

socket.on('analysis-complete', (data) => {
  console.log('[Socket] Analysis finished!', data.analysis);
});

socket.on('analysis-error', (data) => {
  console.error('[Socket] Analysis error:', data.error);
});

socket.on('analysis-error', (data) => {
  console.error('[Socket] Analysis failed:', data.error);
});

export default socket;
