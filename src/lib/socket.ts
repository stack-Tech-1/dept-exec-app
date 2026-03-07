import { io } from 'socket.io-client';
import { authService } from '@/services/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.ipeexecs.page';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected');
  const user = authService.getCurrentUser();
  if (user?.id) socket.emit('join-user', { userId: user.id });
});

socket.on('notification', (notification) => {
  console.log('📢 New notification:', notification);
  window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});

// Backward-compatibility shim — existing code calls socketService.connect() / disconnect()
export const socketService = {
  connect:     () => { if (!socket.connected) socket.connect(); },
  disconnect:  () => socket.disconnect(),
  isConnected: () => socket.connected,
};
