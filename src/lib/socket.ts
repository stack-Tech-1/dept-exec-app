// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\lib\socket.ts
import { io, Socket } from 'socket.io-client';
import { authService } from '@/services/auth';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      
      // Join user-specific room
      const user = authService.getCurrentUser();
      if (user?.id) {
        this.socket?.emit('join-user', user.id);
      }
    });

    this.socket.on('notification', (notification) => {
      console.log('📢 New notification:', notification);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('new-notification', {
        detail: notification
      }));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();