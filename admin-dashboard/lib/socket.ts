import { io, Socket } from 'socket.io-client';
import { getTokens, getApiBaseUrl } from './api';

let socketInstance: Socket | null = null;

export function getAdminSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  const { access } = getTokens();
  if (!access) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  const socketUrl = getApiBaseUrl();

  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      auth: { token: access },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }

  return socketInstance;
}

export function disconnectAdminSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
