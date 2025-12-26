import API from './api';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: 'task' | 'meeting' | 'system' | 'alert';
  metadata?: {
    taskId?: string;
    meetingId?: string;
    userId?: string;
  };
}

class NotificationsService {
  // Get all notifications for current user
  async getNotifications(): Promise<Notification[]> {
    try {
      return await API.get('/notifications');
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return []; // Return empty array on error
    }
  }

  // Mark single notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      return await API.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    try {
      return await API.patch('/notifications/read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Format relative time (e.g., "2 minutes ago")
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Get notification icon based on type
  getNotificationIcon(type?: string) {
    switch (type) {
      case 'task':
        return '📋';
      case 'meeting':
        return '📅';
      case 'alert':
        return '⚠️';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;