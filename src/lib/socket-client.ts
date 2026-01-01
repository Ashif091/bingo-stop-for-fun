import { io, Socket } from 'socket.io-client';

// Singleton socket instance
let socket: Socket | null = null;

// Get the backend URL from environment variable or fallback to same origin
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

export function getSocket(): Socket {
  if (!socket) {
    if (SOCKET_URL) {
      // Connect to external Socket.io server (production - split deployment)
      socket = io(SOCKET_URL, {
        path: '/api/socketio',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'],
      });
    } else {
      // Connect to same origin (local development)
      socket = io({
        path: '/api/socketio',
        addTrailingSlash: false,
      });
    }
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
